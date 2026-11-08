import { describe, expect, it } from 'vitest';

import {
  canLoadNewer,
  canLoadOlder,
  windowLineNumber,
  windowTotal,
  withNewerPage,
  withOlderPage,
} from './log-window';
import type { LogWindowPage } from './log-window';

const page = (
  number: number,
  extra: Partial<LogWindowPage> = {},
): LogWindowPage => ({
  page: number,
  entries: [{ line: `page ${number}` }],
  hasMore: true,
  ...extra,
});

describe('log window', () => {
  it('stacks older pages above and keeps them oldest first', () => {
    let pages = [page(1)];
    pages = withOlderPage(pages, page(2));
    pages = withOlderPage(pages, page(3));
    expect(pages.map((p) => p.page)).toEqual([3, 2, 1]);
  });

  it('unloads the newest pages past the limit and can load them again', () => {
    let pages = [page(1)];
    for (const n of [2, 3, 4]) pages = withOlderPage(pages, page(n), 3);
    expect(pages.map((p) => p.page)).toEqual([4, 3, 2]);
    expect(canLoadNewer(pages)).toBe(true);

    pages = withNewerPage(pages, page(1), 3);
    expect(pages.map((p) => p.page)).toEqual([3, 2, 1]);
    expect(canLoadNewer(pages)).toBe(false);
  });

  it('ignores a page that does not touch the loaded run', () => {
    const pages = [page(2), page(1)];
    expect(withOlderPage(pages, page(5))).toBe(pages);
    expect(withNewerPage([page(3)], page(1))).toEqual([page(3)]);
  });

  it('stops loading older lines at the start of the range', () => {
    expect(canLoadOlder([page(2, { hasMore: false }), page(1)])).toBe(false);
    expect(canLoadOlder([page(2), page(1)])).toBe(true);
    expect(canLoadOlder([])).toBe(false);
  });

  it('numbers rows from the newest line upwards', () => {
    // Page 1 holds 3 lines, oldest first: they read 3, 2, 1.
    expect([0, 1, 2].map((i) => windowLineNumber(1, 200, i, 3))).toEqual([
      3, 2, 1,
    ]);
    expect(windowLineNumber(2, 200, 199, 200)).toBe(201);
  });

  it('reads the total from the newest page that has one', () => {
    expect(windowTotal([page(2, { total: 400 }), page(1)])).toBe(400);
    expect(
      windowTotal([page(2, { total: 400 }), page(1, { total: 420 })]),
    ).toBe(420);
    expect(windowTotal([page(1)])).toBeUndefined();
  });
});
