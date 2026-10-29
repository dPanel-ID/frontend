import { describe, expect, it, vi } from 'vitest';

import {
  LOG_DOWNLOAD_MAX_LINES,
  LogDownloadTooLargeError,
  canDownloadAllLogs,
  fetchAllLogPages,
  formatLogFileLine,
  logFileName,
  maxLogPage,
} from './log-download';
import type { LogPageResult } from './log-download';

function pages(...contents: string[][]) {
  return vi.fn(
    async (page: number): Promise<LogPageResult> => ({
      entries: (contents[page - 1] ?? []).map((line) => ({ line })),
      hasMore: page < contents.length,
      total: contents.flat().length,
    }),
  );
}

describe('fetchAllLogPages', () => {
  it('stitches newest-first pages into one oldest-first list', async () => {
    // Page 1 holds the newest lines; each page lists its own lines oldest first.
    const fetchPage = pages(['l5', 'l6'], ['l3', 'l4'], ['l1', 'l2']);
    const progress = vi.fn();

    const entries = await fetchAllLogPages({
      fetchPage,
      signal: new AbortController().signal,
      onProgress: progress,
    });

    expect(entries.map((entry) => entry.line)).toEqual([
      'l1',
      'l2',
      'l3',
      'l4',
      'l5',
      'l6',
    ]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(progress).toHaveBeenLastCalledWith({
      fetchedLines: 6,
      totalLines: 6,
    });
  });

  it('stops on an empty page even if more were promised', async () => {
    const fetchPage = vi.fn(
      async (): Promise<LogPageResult> => ({ entries: [], hasMore: true }),
    );

    await fetchAllLogPages({
      fetchPage,
      signal: new AbortController().signal,
    });

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('refuses a window larger than one download fetches', async () => {
    const fetchPage = vi.fn(
      async (): Promise<LogPageResult> => ({
        entries: [{ line: 'x' }],
        hasMore: true,
        total: LOG_DOWNLOAD_MAX_LINES + 1,
      }),
    );

    await expect(
      fetchAllLogPages({ fetchPage, signal: new AbortController().signal }),
    ).rejects.toBeInstanceOf(LogDownloadTooLargeError);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('stops at the cap when the total is unknown', async () => {
    const fetchPage = vi.fn(
      async (): Promise<LogPageResult> => ({
        entries: Array.from({ length: 50_000 }, () => ({ line: 'x' })),
        hasMore: true,
      }),
    );

    await expect(
      fetchAllLogPages({ fetchPage, signal: new AbortController().signal }),
    ).rejects.toBeInstanceOf(LogDownloadTooLargeError);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('stops fetching once cancelled', async () => {
    const controller = new AbortController();
    const fetchPage = vi.fn(async (page: number): Promise<LogPageResult> => {
      if (page === 2) controller.abort();
      return { entries: [{ line: `p${page}` }], hasMore: true };
    });

    await expect(
      fetchAllLogPages({ fetchPage, signal: controller.signal }),
    ).rejects.toThrow();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});

describe('canDownloadAllLogs', () => {
  it.each([
    [undefined, true],
    [LOG_DOWNLOAD_MAX_LINES, true],
    [LOG_DOWNLOAD_MAX_LINES + 1, false],
  ])('total %s → %s', (total, expected) => {
    expect(canDownloadAllLogs(total)).toBe(expected);
  });
});

describe('formatLogFileLine', () => {
  it('leads with the ISO time and level', () => {
    expect(
      formatLogFileLine({
        line: '[postRequestJSON] Response from API: {"message":"success"}',
        severity: 'info',
        time: String(Date.UTC(2026, 9, 29, 13, 26, 25, 123)),
      }),
    ).toBe(
      '2026-10-29T13:26:25.123Z\tINFO\t[postRequestJSON] Response from API: {"message":"success"}',
    );
  });

  it('marks a missing time or level', () => {
    expect(formatLogFileLine({ line: 'plain' })).toBe('-\t-\tplain');
  });
});

describe('logFileName', () => {
  it('names the source, the window and the page', () => {
    expect(
      logFileName({
        name: 'pubsub consumer',
        timeGte: '2026-10-29T12:00:00.000Z',
        timeLt: '2026-10-29T13:00:00.000Z',
        page: 2,
      }),
    ).toBe('pubsub-consumer_2026-10-29T12-00Z_to_2026-10-29T13-00Z_page-2.log');
  });
});

describe('maxLogPage', () => {
  it('stops at the deepest offset the log store reaches', () => {
    expect(maxLogPage(200)).toBe(5001);
    expect(maxLogPage(500)).toBe(2001);
  });
});
