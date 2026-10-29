import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { DownloadIcon, RefreshCwIcon, ScrollTextIcon } from 'lucide-react';
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

import { LOG_LEVEL_ORDER, countLogLevels } from '../../../../-lib/log-entries';
import type { LogTimeRange } from '../../../../-lib/log-time-range';
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
  lineLimit: number;
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
  onDownload?: () => void;
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
    isRefreshing,
    lineLimit,
    onDownload,
    onRefresh,
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
          {onDownload && (
            <Button
              size="icon-sm"
              buttonColor="secondary"
              buttonStyle="outline"
              disabled={entries.length === 0}
              onClick={onDownload}
              aria-label={t('downloadLog')}
              title={t('downloadLog')}
            >
              <DownloadIcon />
            </Button>
          )}
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
              limit: lineLimit,
            })}
          </DataPanelMeta>
        </>
      }
      footer={
        (query || queryErrors.length > 0) && (
          <>
            {query && (
              <DataPanelMeta>
                <span className="break-all font-mono" title={query}>
                  {query}
                </span>
              </DataPanelMeta>
            )}
            {queryErrors.map((warning, index) => (
              <p
                key={`${index}:${warning}`}
                className="text-xs text-amber-600 dark:text-amber-300"
              >
                {warning}
              </p>
            ))}
          </>
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
