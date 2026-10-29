import type { ReactNode } from 'react';

import { RefreshCwIcon, ScrollTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import { maxLogPage } from '../../lib/log-download';
import type { LogTimeRange } from '../../lib/log-time-range';
import { useLogFilters } from '../../usecase/use-log-filters';
import LogDownloadMenu from '../LogDownloadMenu';
import type { LogDownloadMenuProps } from '../LogDownloadMenu';
import LogPager from '../LogPager';
import LogResults from '../LogResults';
import LogTimeRangeMenu from '../LogTimeRangeMenu';

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

  const t = useDevetekTranslations('common.logViewer');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const filters = useLogFilters(entries);

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
              value={filters.search}
              placeholder={t('filterPlaceholder')}
              onChange={filters.setSearch}
            />
          </div>
          <DataPanelMeta>
            {t('showing', {
              shown: filters.filteredEntries.length,
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
          <LogResults
            ariaLabel={title}
            filters={filters}
            timeZoneLabel={timeZoneLabel}
            scrollResetKey={scrollResetKey}
          />
        </>
      )}
    </DataPanel>
  );
}
