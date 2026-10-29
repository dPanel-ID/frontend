import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { RefreshCwIcon, ScrollTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type {
  LogLevel,
  ParsedLogLine,
} from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import { maxLogPage } from '../../../../-lib/log-download';
import { LOG_LEVEL_ORDER, countLogLevels } from '../../../../-lib/log-entries';
import type { LogTimeRange } from '../../../../-lib/log-time-range';
import LogDownloadMenu from '../LogDownloadMenu';
import type { LogDownloadMenuProps } from '../LogDownloadMenu';
import LogPager from '../LogPager';
import LogTimeRangeMenu from '../LogTimeRangeMenu';
import LogViewer from '../LogViewer';

export type LogsPanelStatus = 'unavailable' | 'loading' | 'failed' | 'ready';

/**
 * Panel state for a logs response. A refresh keeps showing the previous lines
 * (the refresh button spins) instead of blanking the table.
 */
export function toLogsPanelStatus(response: {
  $status: string;
  prevData?: unknown;
}): LogsPanelStatus {
  if (response.$status === 'success') return 'ready';
  if (response.$status === 'failed') return 'failed';
  if (response.$status === 'loading' && response.prevData) return 'ready';
  return 'loading';
}

interface LogsPanelProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** What the lines come from, e.g. the service or domain, left of the range. */
  source?: ReactNode;
  status: LogsPanelStatus;
  entries: ParsedLogLine[];
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    totalLines?: number;
    onPageChange: (page: number) => void;
  };
  download: Omit<
    LogDownloadMenuProps,
    'page' | 'pageLines' | 'totalLines' | 'canDownloadAll'
  > & { canDownloadAll: boolean };
  timeRange: LogTimeRange;
  timeZoneLabel: string;
  query?: string;
  queryErrors?: string[];
  isRefreshing: boolean;
  emptyTitle: string;
  emptyDescription: string;
  unavailableTitle?: string;
  scrollResetKey?: string;
  onRefresh: () => void;
  onTimeRangeChange: (range: LogTimeRange) => void;
}

type LevelFilter = LogLevel | 'all';

/** Log lines in the standard data panel, with search and level filters. */
export default function LogsPanel(props: LogsPanelProps) {
  const {
    description,
    emptyDescription,
    emptyTitle,
    entries,
    icon = ScrollTextIcon,
    download,
    isRefreshing,
    onRefresh,
    pagination,
    onTimeRangeChange,
    query,
    queryErrors = [],
    scrollResetKey,
    source,
    status,
    timeRange,
    timeZoneLabel,
    title,
    unavailableTitle,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const tCommon = useDevetekTranslations('common.dataPanel');

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

  const levelCounts = useMemo(() => countLogLevels(entries), [entries]);
  const presentLevels = LOG_LEVEL_ORDER.filter((level) =>
    levelCounts.has(level),
  );
  // A level that disappears after a refresh no longer filters anything out.
  const activeLevel =
    levelFilter !== 'all' && levelCounts.has(levelFilter) ? levelFilter : 'all';

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (activeLevel === 'all' || entry.level === activeLevel) &&
        (!term || entry.searchText.toLowerCase().includes(term)),
    );
  }, [activeLevel, entries, search]);

  const clearFilters = () => {
    setSearch('');
    setLevelFilter('all');
  };

  return (
    <DataPanel
      icon={icon}
      title={title}
      description={description}
      actions={
        <>
          <LogDownloadMenu
            {...download}
            page={pagination.page}
            pageLines={entries.length}
            totalLines={pagination.totalLines}
          />
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            disabled={status === 'unavailable' || isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCwIcon className={cn(isRefreshing && 'animate-spin')} />
            {tCommon('refresh')}
          </Button>
        </>
      }
      toolbar={
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {source}
            <LogTimeRangeMenu value={timeRange} onChange={onTimeRangeChange} />
            <DataPanelSearch
              value={search}
              placeholder={t('filterPlaceholder')}
              onChange={setSearch}
            />
          </div>
          <DataPanelMeta>
            {t('showing', {
              shown: filteredEntries.length,
              total: entries.length,
            })}
          </DataPanelMeta>
        </>
      }
      footer={
        status === 'ready' &&
        (entries.length > 0 || pagination.page > 1) && (
          <LogPager
            page={pagination.page}
            pageSize={pagination.pageSize}
            pageLines={entries.length}
            hasMore={pagination.hasMore}
            totalLines={pagination.totalLines}
            maxPage={maxLogPage(pagination.pageSize)}
            disabled={isRefreshing}
            onPageChange={pagination.onPageChange}
          />
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
      ) : entries.length === 0 ? (
        <DataPanelState
          state="empty"
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          {(query || queryErrors.length > 0) && (
            <div className="grid gap-1 border-b px-3 py-2 text-xs">
              {query && (
                <details className="text-muted-foreground">
                  <summary className="cursor-pointer select-none font-medium">
                    {t('query')}
                  </summary>
                  <code className="mt-1 block break-all font-mono text-[11px]">
                    {query}
                  </code>
                </details>
              )}
              {queryErrors.map((warning, index) => (
                <p
                  key={`${index}:${warning}`}
                  className="text-amber-600 dark:text-amber-300"
                >
                  {warning}
                </p>
              ))}
            </div>
          )}
          {presentLevels.length > 1 && (
            <div
              role="group"
              aria-label={t('levelFilter')}
              className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2"
            >
              <LevelChip
                active={activeLevel === 'all'}
                count={entries.length}
                label={t('allLevels')}
                onClick={() => setLevelFilter('all')}
              />
              {presentLevels.map((level) => (
                <LevelChip
                  key={level}
                  active={activeLevel === level}
                  count={levelCounts.get(level) ?? 0}
                  label={level}
                  level={level}
                  onClick={() => setLevelFilter(level)}
                />
              ))}
            </div>
          )}

          {filteredEntries.length === 0 ? (
            <DataPanelState
              state="empty"
              title={t('noMatch')}
              action={
                <Button
                  buttonStyle="outline"
                  buttonColor="secondary"
                  size="sm"
                  onClick={clearFilters}
                >
                  {tCommon('clearSearch')}
                </Button>
              }
            />
          ) : (
            <LogViewer
              ariaLabel={title}
              entries={filteredEntries}
              timeZoneLabel={timeZoneLabel}
              scrollResetKey={`${scrollResetKey}:${activeLevel}:${search}`}
            />
          )}
        </>
      )}
    </DataPanel>
  );
}

const LEVEL_DOT: Record<LogLevel, string> = {
  debug: 'bg-sky-500',
  info: 'bg-emerald-500',
  notice: 'bg-violet-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
  fatal: 'bg-red-700',
};

function LevelChip(props: {
  active: boolean;
  count: number;
  label: string;
  level?: LogLevel;
  onClick: () => void;
}) {
  const { active, count, label, level, onClick } = props;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium capitalize transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-sky-400/40 bg-background text-primary shadow-sm'
          : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-primary',
      )}
    >
      {level && (
        <span className={cn('size-2 rounded-full', LEVEL_DOT[level])} />
      )}
      {label}
      <span className="font-mono text-[11px] text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
