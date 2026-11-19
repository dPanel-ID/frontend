// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogController } from '@/services/dialog';
import { useToasterSubscribe } from '@/services/toaster/model/toasterEvent';
import type { ToasterItem } from '@/services/toaster/rules/types';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';
import { EventsProvider } from '@/shared/libs/events';

import useApplicationDeleteUsecase from './application-delete';

const doDelete = vi.fn();
const navigate = vi.fn();

vi.mock('@/shared/api', () => ({
  ApiApplication: {
    Delete: { $Id: { doDelete: (...args: unknown[]) => doDelete(...args) } },
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}));

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, string>) =>
      values?.name ? `${key}:${values.name}` : key,
  useDevetekLocale: () => 'en',
}));

const toasts: ToasterItem[] = [];
const onSuccess = vi.fn();

function ToastSpy() {
  useToasterSubscribe('%%toaster/push', (toast) => {
    toasts.push(toast);
  });
  return null;
}

function Trigger() {
  const [deleteApplication] = useApplicationDeleteUsecase({ onSuccess });
  return (
    <button
      type="button"
      onClick={() => deleteApplication({ appName: 'blog', id: '42' })}
    >
      delete blog
    </button>
  );
}

function renderFlow() {
  render(
    <EventsProvider>
      <DialogController />
      <ToastSpy />
      <Trigger />
    </EventsProvider>,
  );
  act(() => {
    fireEvent.click(screen.getByText('delete blog'));
  });
}

function failure(code: number, error: string) {
  return {
    $status: 'failed',
    kind: 'api',
    error: new BaseResponseError({ code, status: 'error', error, data: null }),
  };
}

async function confirm() {
  await act(async () => {
    fireEvent.click(screen.getByText('common.actions.yes'));
    // Let the mocked delete answer.
    await Promise.resolve();
  });
}

beforeEach(() => {
  toasts.length = 0;
});

afterEach(() => {
  cleanup();
  doDelete.mockReset();
  navigate.mockReset();
  onSuccess.mockReset();
});

describe('application delete', () => {
  it('deletes after the question and says so', async () => {
    doDelete.mockResolvedValue({ $status: 'success' });
    renderFlow();
    expect(screen.getByText('confirmTitle')).toBeTruthy();

    await confirm();

    expect(doDelete).toHaveBeenCalledWith({ applicationId: '42' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(toasts).toEqual([
      expect.objectContaining({ variant: 'success', message: 'deleted:blog' }),
    ]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  // The 409 "still released on a server" showed no visible error at all.
  it('explains a release still on a server and offers the Deployments tab', async () => {
    doDelete.mockResolvedValue(
      failure(409, 'application is still released on a server'),
    );
    renderFlow();

    await confirm();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('stillReleasedTitle')).toBeTruthy();
    expect(screen.getByText('stillReleasedDescription:blog')).toBeTruthy();
    // Nothing is removed on the person's behalf: only one delete call.
    expect(doDelete).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent.click(screen.getByText('openDeployments'));
    });
    expect(navigate).toHaveBeenCalledWith({
      to: '/applications/$id',
      params: { id: '42' },
      search: { tab: 'deployments' },
    });
  });

  it('shows the API message for any other failure', async () => {
    doDelete.mockResolvedValue(failure(500, 'Something went wrong'));
    renderFlow();

    await confirm();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(toasts).toEqual([
      expect.objectContaining({
        variant: 'error',
        title: 'failedTitle:blog',
        message: 'Something went wrong',
      }),
    ]);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
