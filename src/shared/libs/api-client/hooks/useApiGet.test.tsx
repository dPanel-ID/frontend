// @vitest-environment jsdom

import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { axiosClient } from '../lib/client';

import useApiGet from './useApiGet';

vi.mock('../lib/client', () => ({ axiosClient: vi.fn() }));

const mockedClient = vi.mocked(
  axiosClient as unknown as () => Promise<unknown>,
);

function envelope(value: string) {
  return { data: { code: 200, data: { value } } };
}

function answer(value: string) {
  return Promise.resolve(envelope(value));
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse('2026-11-18T10:00:00Z'));
  setVisibility('visible');
  mockedClient.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useApiGet silent background refresh', () => {
  it('keeps the answer on screen and stamps when it arrived', async () => {
    mockedClient.mockReturnValueOnce(answer('first'));
    const { result } = renderHook(() =>
      useApiGet<{ value: string }>(
        { url: '/x' },
        { refreshIntervalMs: 60_000, silentRefresh: true },
      ),
    );
    await flush();
    expect(result.current[0]).toMatchObject({
      $status: 'success',
      value: 'first',
    });
    const firstAt = result.current[2].receivedAt;
    expect(firstAt).toBe(Date.parse('2026-11-18T10:00:00Z'));

    let resolve!: (value: unknown) => void;
    mockedClient.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    // In flight: still the old answer, never a loading state.
    expect(result.current[0]).toMatchObject({
      $status: 'success',
      value: 'first',
    });

    resolve(envelope('second'));
    await flush();
    expect(result.current[0]).toMatchObject({
      $status: 'success',
      value: 'second',
    });
    expect(result.current[2].receivedAt).toBeGreaterThan(firstAt ?? 0);
  });

  it('keeps the last answer when a background refresh fails', async () => {
    mockedClient.mockReturnValueOnce(answer('first'));
    const { result } = renderHook(() =>
      useApiGet<{ value: string }>(
        { url: '/x' },
        { refreshIntervalMs: 60_000, silentRefresh: true },
      ),
    );
    await flush();
    const firstAt = result.current[2].receivedAt;

    mockedClient.mockImplementationOnce(() =>
      Promise.reject(new Error('offline')),
    );
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    await flush();

    expect(result.current[0]).toMatchObject({
      $status: 'success',
      value: 'first',
    });
    // The reading did not get fresher.
    expect(result.current[2].receivedAt).toBe(firstAt);
  });

  it('refetches when the tab comes back and skips polls while hidden', async () => {
    mockedClient.mockReturnValue(answer('again'));
    renderHook(() =>
      useApiGet<{ value: string }>(
        { url: '/x' },
        {
          refreshIntervalMs: 60_000,
          silentRefresh: true,
          refetchOnVisible: true,
        },
      ),
    );
    await flush();
    expect(mockedClient).toHaveBeenCalledTimes(1);

    act(() => setVisibility('hidden'));
    act(() => {
      vi.advanceTimersByTime(180_000);
    });
    expect(mockedClient).toHaveBeenCalledTimes(1);

    act(() => setVisibility('visible'));
    await flush();
    expect(mockedClient).toHaveBeenCalledTimes(2);
  });
});
