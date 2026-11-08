import { useMemo } from 'react';

import { useDevetekLocale } from '@/services/i18n';

import { toParsedLogLines } from '../lib/log-entries';
import { windowLineNumber } from '../lib/log-window';
import type { LogWindowPages } from '../lib/log-window';
import type { InfiniteLogPage } from '../presentation/InfiniteLogTable';

import { useLogFilters } from './use-log-filters';

interface UseWindowRowsOptions {
  pages: LogWindowPages;
  pageSize: number;
  /** Shown as the source of a line that names none. */
  fallbackSource: string;
  /** When the window was requested, for relative times such as "Today". */
  nowMs: number;
}

/**
 * The rows of a log window, numbered from the newest line, with the search
 * and level filters applied page by page for the infinite list.
 */
export function useWindowRows(options: UseWindowRowsOptions) {
  const { fallbackSource, nowMs, pageSize, pages } = options;
  const locale = useDevetekLocale();

  const parsedPages = useMemo(
    () =>
      pages.map((page) => ({
        page: page.page,
        rows: toParsedLogLines(page.entries, {
          fallbackSource,
          locale,
          nowMs,
        }).map((row, index) => ({
          ...row,
          // Ids repeat across pages only by accident; the page keeps them apart.
          id: `${page.page}:${row.id}`,
          lineNumber: windowLineNumber(
            page.page,
            pageSize,
            index,
            page.entries.length,
          ),
        })),
      })),
    [fallbackSource, locale, nowMs, pageSize, pages],
  );
  const loadedRows = useMemo(
    () => parsedPages.flatMap((page) => page.rows),
    [parsedPages],
  );
  const loadedEntries = useMemo(
    () => pages.flatMap((page) => page.entries),
    [pages],
  );

  const filters = useLogFilters(loadedRows);
  const visiblePages = useMemo<InfiniteLogPage[]>(() => {
    const visible = new Set(filters.filteredEntries.map((row) => row.id));
    return parsedPages.map((page) => ({
      page: page.page,
      rows: page.rows.filter((row) => visible.has(row.id)),
    }));
  }, [filters.filteredEntries, parsedPages]);

  return {
    loadedRows,
    loadedEntries,
    filters,
    visiblePages,
    /** Older lines load by themselves only while nothing is filtered out. */
    autoFill: filters.activeLevel === 'all' && !filters.search.trim(),
  };
}
