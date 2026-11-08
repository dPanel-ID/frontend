import type { LogEntryInput } from './log-entries';

/**
 * The pages of a log window an infinite list keeps in memory. Page 1 holds
 * the newest lines of the window; higher pages are older. A window keeps a
 * contiguous run of pages so the browser never holds more than
 * `LOG_WINDOW_MAX_PAGES` pages of rows, however long someone scrolls or
 * watches.
 */
export const LOG_WINDOW_MAX_PAGES = 5;

export interface LogWindowPage {
  /** 1 is the newest page of the window. */
  page: number;
  /** Oldest first, as the logs API returns a page. */
  entries: LogEntryInput[];
  hasMore: boolean;
  total?: number;
}

/** Pages oldest first, the order they are shown in, top to bottom. */
export type LogWindowPages = LogWindowPage[];

export function oldestLoadedPage(pages: LogWindowPages) {
  return pages[0];
}

export function newestLoadedPage(pages: LogWindowPages) {
  return pages[pages.length - 1];
}

/** Whether older lines exist above the oldest loaded page. */
export function canLoadOlder(pages: LogWindowPages) {
  const oldest = oldestLoadedPage(pages);
  return Boolean(oldest?.hasMore);
}

/** Whether newer pages were unloaded below the newest loaded page. */
export function canLoadNewer(pages: LogWindowPages) {
  const newest = newestLoadedPage(pages);
  return newest !== undefined && newest.page > 1;
}

/**
 * Adds an older page above the loaded run, unloading the newest pages past
 * the limit.
 */
export function withOlderPage(
  pages: LogWindowPages,
  older: LogWindowPage,
  maxPages = LOG_WINDOW_MAX_PAGES,
): LogWindowPages {
  const oldest = oldestLoadedPage(pages);
  if (oldest && older.page !== oldest.page + 1) return pages;
  const next = [older, ...pages];
  return next.length > maxPages ? next.slice(0, maxPages) : next;
}

/**
 * Adds a newer page below the loaded run, unloading the oldest pages past
 * the limit.
 */
export function withNewerPage(
  pages: LogWindowPages,
  newer: LogWindowPage,
  maxPages = LOG_WINDOW_MAX_PAGES,
): LogWindowPages {
  const newest = newestLoadedPage(pages);
  if (newest && newer.page !== newest.page - 1) return pages;
  const next = [...pages, newer];
  return next.length > maxPages ? next.slice(next.length - maxPages) : next;
}

/**
 * A row's number counted from the newest line of the window, so the bottom
 * row reads 1 and numbers grow upwards with age.
 */
export function windowLineNumber(
  page: number,
  pageSize: number,
  index: number,
  pageLength: number,
) {
  return (page - 1) * pageSize + (pageLength - index);
}

/** The window's line total, from the newest page that reported one. */
export function windowTotal(pages: LogWindowPages) {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const total = pages[index]?.total;
    if (total !== undefined) return total;
  }
  return undefined;
}
