import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ScrollTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import type { LogEntryInput } from '../../lib/log-entries';
import { toParsedLogLines } from '../../lib/log-entries';
import type { LogTimeRange } from '../../lib/log-time-range';
import { windowLineNumber } from '../../lib/log-window';
import { useAutoRefresh } from '../../usecase/use-auto-refresh';
import { useLogFilters } from '../../usecase/use-log-filters';
import type { LogWindowState } from '../../usecase/use-log-window';
import InfiniteLogTable from '../InfiniteLogTable';
import type { InfiniteLogPage } from '../InfiniteLogTable';
import LogDownloadMenu from '../LogDownloadMenu';
import type { LogDownloadMenuProps } from '../LogDownloadMenu';
import LogLevelFilter from '../LogLevelFilter';
import LogRefreshControl from '../LogRefreshControl';
import LogTimeRangeMenu from '../LogTimeRangeMenu';

interface InfiniteLogsPanelProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** What the lines come from, e.g. the domain, left of the range. */
  source?: ReactNode;
  window: LogWindowState;
  /** Changes with the window; the list then jumps to its newest line. */
  windowKey: string;
  pageSize: number;
  /** Shown as the source of a line that names none. */
  fallbackSource: string;
  /** When the window was requested, for relative times such as "Today". */
  nowMs: number;
  download: Omit<
    LogDownloadMenuProps,
    'page' | 'pageLines' | 'totalLines' | 'scope' | 'onDownloadPage'
  > & { onDownloadLoaded: (entries: LogEntryInput[]) => void };
  timeRange: LogTimeRange;
  timeZoneLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  unavailableTitle?: string;
  /** Re-anchors the window on "now" and reloads its newest lines. */
  onRefresh: () => void;
  onTimeRangeChange: (range: LogTimeRange) => void;
}

/**
 * Log lines in the standard data panel, read like a terminal: newest at the
 * bottom, older lines loaded while scrolling up. Auto-refresh only runs while
 * the reader follows the newest line, so it never pulls the view away.
 */
export default function InfiniteLogsPanel(props: InfiniteLogsPanelProps) {
  const {
    description,
    download,
    emptyDescription,
    emptyTitle,
    fallbackSource,
    icon = ScrollTextIcon,
    nowMs,
    onRefresh,
    onTimeRangeChange,
    pageSize,
    source,
    timeRange,
    timeZoneLabel,
    title,
    unavailableTitle,
    window: logWindow,
    windowKey,
  } = props;

  const t = useDevetekTranslations('common.logViewer');
  const locale = useDevetekLocale();
  const [following, setFollowing] = useState(true);

  const parsedPages = useMemo(
    () =>
      logWindow.pages.map((page) => ({
        page: page.page,
        rows: toParsedLogLines(page.entries, {
          fallbackSource,
          locale,
          nowMs,
        }).map((row, index) => ({
          ...row,
          id: `${page.page}:${row.id}`,
          lineNumber: windowLineNumber(
            page.page,
            pageSize,
            index,
            page.entries.length,
          ),
        })),
      })),
    [fallbackSource, locale, logWindow.pages, nowMs, pageSize],
  );
  const loadedRows = useMemo(
    () => parsedPages.flatMap((page) => page.rows),
    [parsedPages],
  );
  const loadedEntries = useMemo(
    () => logWindow.pages.flatMap((page) => page.entries),
    [logWindow.pages],
  );

  const filters = useLogFilters(loadedRows);
  const visiblePages = useMemo<InfiniteLogPage[]>(() => {
    const visible = new Set(filters.filteredEntries.map((row) => row.id));
    return parsedPages.map((page) => ({
      page: page.page,
      rows: page.rows.filter((row) => visible.has(row.id)),
    }));
  }, [filters.filteredEntries, parsedPages]);

  const status = logWindow.status;
  const autoRefresh = useAutoRefresh(onRefresh, {
    paused: status === 'unavailable' || !following,
  });

  const firstLine = loadedRows.reduce(
    (min, row) => Math.min(min, row.lineNumber),
    Number.POSITIVE_INFINITY,
  );
  const lastLine = loadedRows.reduce(
    (max, row) => Math.max(max, row.lineNumber),
    0,
  );

  return (
    <DataPanel
      icon={icon}
      title={title}
      description={description}
      actions={
        <>
          <LogDownloadMenu
            {...download}
            scope="loaded"
            page={1}
            pageLines={loadedEntries.length}
            totalLines={logWindow.total}
            onDownloadPage={() => download.onDownloadLoaded(loadedEntries)}
          />
          <LogRefreshControl
            state={autoRefresh}
            isRefreshing={logWindow.isResetting}
            disabled={status === 'unavailable'}
            onRefresh={onRefresh}
          />
        </>
      }
      toolbar={
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {source}
            <LogTimeRangeMenu value={timeRange} onChange={onTimeRangeChange} />
            <DataPanelSearch
              value={filters.search}
              placeholder={t('infinite.filterPlaceholder')}
              onChange={filters.setSearch}
            />
          </div>
          <DataPanelMeta>
            {t('infinite.showing', {
              shown: filters.filteredEntries.length,
              total: loadedRows.length,
            })}
          </DataPanelMeta>
        </>
      }
      footer={
        status === 'ready' &&
        loadedRows.length > 0 && (
          <p className="px-1 text-xs text-muted-foreground tabular-nums">
            {logWindow.total === undefined
              ? t('infinite.rangeUnknown', { first: firstLine, last: lastLine })
              : t('infinite.range', {
                  first: firstLine,
                  last: lastLine,
                  total: logWindow.total,
                })}
          </p>
        )
      }
    >
      {status === 'unavailable' ? (
        <DataPanelState state="empty" title={unavailableTitle ?? emptyTitle} />
      ) : status === 'loading' ? (
        <DataPanelState state="loading" title={t('loading')} />
      ) : status === 'failed' ? (
        <DataPanelState
          state="failed"
          title={t('failed')}
          action={<DataPanelRetry onClick={onRefresh} />}
        />
      ) : loadedRows.length === 0 ? (
        <DataPanelState
          state="empty"
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          {(logWindow.query || logWindow.queryErrors.length > 0) && (
            <div className="grid gap-1 border-b px-3 py-2 text-xs">
              {logWindow.query && (
                <details className="text-muted-foreground">
                  <summary className="cursor-pointer select-none font-medium">
                    {t('query')}
                  </summary>
                  <code className="mt-1 block whitespace-pre-wrap break-all font-mono text-[11px]">
                    {logWindow.query}
                  </code>
                </details>
              )}
              {logWindow.queryErrors.map((warning, index) => (
                <p
                  key={`${index}:${warning}`}
                  className="text-amber-600 dark:text-amber-300"
                >
                  {warning}
                </p>
              ))}
            </div>
          )}
          <LogLevelFilter filters={filters} />
          {filters.filteredEntries.length === 0 && (
            <div className="flex items-center justify-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
              <span>{t('noMatch')}</span>
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                size="xs"
                onClick={filters.clearFilters}
              >
                {t('infinite.clearFilters')}
              </Button>
            </div>
          )}
          <InfiniteLogTable
            ariaLabel={title}
            pages={visiblePages}
            timeZoneLabel={timeZoneLabel}
            nowMs={nowMs}
            hasOlder={logWindow.hasOlder}
            hasNewer={logWindow.hasNewer}
            loading={logWindow.loading}
            edgeError={logWindow.edgeError}
            windowKey={windowKey}
            onLoadOlder={logWindow.loadOlder}
            onLoadNewer={logWindow.loadNewer}
            autoFill={filters.activeLevel === 'all' && !filters.search.trim()}
            onFollowChange={setFollowing}
            onJumpToLatest={onRefresh}
          />
        </>
      )}
    </DataPanel>
  );
}
