import { parseLogEntryTime } from './log-entries';
import type { LogEntryInput } from './log-entries';

/**
 * Lines per request while downloading a whole window. Uptrace answers 500
 * lines over 10 days in ~2-3s but 1000 in ~10s, which reaches the API's
 * upstream timeout.
 */
export const LOG_DOWNLOAD_PAGE_SIZE = 500;

/**
 * The most lines one "download all" fetches (200 requests). Larger windows are
 * downloaded page by page, or narrowed first, so a tab never holds hundreds of
 * megabytes or runs for an hour.
 */
export const LOG_DOWNLOAD_MAX_LINES = 100_000;

/** The deepest offset the log store pages to; the API rejects pages past it. */
export const LOG_MAX_OFFSET = 1_000_000;

/** The last page a window of `pageSize` lines can reach. */
export function maxLogPage(pageSize: number) {
  return Math.floor(LOG_MAX_OFFSET / pageSize) + 1;
}

export interface LogPageResult {
  entries: LogEntryInput[];
  hasMore: boolean;
  /** Lines in the whole window, when the API reports it. */
  total?: number;
}

export interface LogDownloadProgress {
  fetchedLines: number;
  totalLines?: number;
}

/** Whether "download all" can fetch the window in one go. */
export function canDownloadAllLogs(totalLines: number | undefined) {
  return totalLines === undefined || totalLines <= LOG_DOWNLOAD_MAX_LINES;
}

/** One line of a downloaded file: ISO time, level, then the line as logged. */
export function formatLogFileLine(entry: LogEntryInput) {
  const timeMs = parseLogEntryTime(entry.time);
  const time = timeMs === undefined ? '-' : new Date(timeMs).toISOString();
  const severity = (entry.severity?.trim() || '-').toUpperCase();

  return `${time}\t${severity}\t${entry.line}`;
}

/** Lines of one page, oldest first, ready to save. */
export function formatLogFile(entries: LogEntryInput[]) {
  return entries.map(formatLogFileLine).join('\n');
}

/**
 * Fetches every page of a fixed window, one request at a time, and returns
 * the lines oldest first. Pages come newest first while each page lists its
 * lines oldest first, so pages are stitched together in reverse.
 */
export async function fetchAllLogPages(params: {
  fetchPage: (page: number, signal: AbortSignal) => Promise<LogPageResult>;
  signal: AbortSignal;
  onProgress?: (progress: LogDownloadProgress) => void;
}): Promise<LogEntryInput[]> {
  const { fetchPage, onProgress, signal } = params;
  const pages: LogEntryInput[][] = [];
  let fetchedLines = 0;
  let totalLines: number | undefined;

  for (let page = 1; ; page += 1) {
    signal.throwIfAborted();

    const result = await fetchPage(page, signal);
    totalLines ??= result.total;
    if (!canDownloadAllLogs(totalLines)) {
      throw new LogDownloadTooLargeError(totalLines ?? fetchedLines);
    }

    pages.push(result.entries);
    fetchedLines += result.entries.length;
    onProgress?.({ fetchedLines, totalLines });

    if (!result.hasMore || result.entries.length === 0) break;
    // Without a total, stop at the cap rather than walking on indefinitely.
    if (fetchedLines >= LOG_DOWNLOAD_MAX_LINES) {
      throw new LogDownloadTooLargeError(fetchedLines);
    }
  }

  return pages.reverse().flat();
}

/** The window holds more lines than one download fetches. */
export class LogDownloadTooLargeError extends Error {
  constructor(readonly lines: number) {
    super(`log window holds more than ${LOG_DOWNLOAD_MAX_LINES} lines`);
    this.name = 'LogDownloadTooLargeError';
  }
}

/** A file name that says what was downloaded, e.g. "api_2026-10-29T13-00Z_page-2.log". */
export function logFileName(params: {
  name: string;
  timeGte: string;
  timeLt: string;
  page?: number;
}) {
  const { name, page, timeGte, timeLt } = params;
  const stamp = (iso: string) => iso.slice(0, 16).replace(/:/g, '-') + 'Z';
  const safeName = name.replace(/[^\w.-]+/g, '-') || 'logs';
  const suffix = page ? `_page-${page}` : '';

  return `${safeName}_${stamp(timeGte)}_to_${stamp(timeLt)}${suffix}.log`;
}

/** Hands the browser a text file to save. */
export function saveLogFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
