import { useCallback, useMemo, useState } from 'react';

import { GlobeIcon, NetworkIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ApiLoadBalancer } from '@/shared/api';
import type { DTOs } from '@/shared/api';

import {
  LOG_DOWNLOAD_PAGE_SIZE,
  canDownloadAllLogs,
} from '../../../-lib/log-download';
import type { LogPageResult } from '../../../-lib/log-download';
import { toParsedLogLines } from '../../../-lib/log-entries';
import type { LogEntryInput } from '../../../-lib/log-entries';
import {
  DEFAULT_LOG_TIME_RANGE,
  formatUtcOffset,
  logTimeRangeKey,
  resolveLogTimeRange,
} from '../../../-lib/log-time-range';
import type { LogTimeRange } from '../../../-lib/log-time-range';
import { useLogDownload } from '../../../-usecase/log-download';
import LogsPanel, {
  toLogsPanelStatus,
} from '../../AppLogs/_presentation/LogsPanel';

interface LoadBalancerLogsProps {
  loadBalancerId: string;
  domain?: string;
}

/**
 * Requests reaching the load balancer in front of this application, in the
 * same panel the runtime logs use so the two read alike.
 */
export default function LoadBalancerLogs(props: LoadBalancerLogsProps) {
  const { domain, loadBalancerId } = props;

  const tLogs = useDevetekTranslations('page.applicationDetail.logs');
  const locale = useDevetekLocale();

  const [timeRange, setTimeRange] = useState<LogTimeRange>(
    DEFAULT_LOG_TIME_RANGE,
  );
  // Pages are offsets into the window; the anchor stays put while paging.
  const [anchor, setAnchor] = useState(() => Date.now());
  const [page, setPage] = useState(1);
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const { limit, timeGte, timeLt } = resolveLogTimeRange(timeRange, anchor);

  const [response, refresh] = ApiLoadBalancer.Logs.$Id.useGet({
    loadBalancerId,
    limit,
    page,
    timeGte,
    timeLt,
  });

  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading' && response.prevData
        ? response.prevData
        : undefined;

  const entryInputs = useMemo(() => toLogEntryInputs(data), [data]);
  const entries = useMemo(
    () =>
      toParsedLogLines(entryInputs, {
        fallbackSource: tLogs('loadBalancer'),
        locale,
        nowMs: anchor,
        lineOffset: (page - 1) * limit,
      }),
    [anchor, entryInputs, limit, locale, page, tLogs],
  );

  const fetchPage = useCallback(
    async (pageNumber: number, signal: AbortSignal): Promise<LogPageResult> => {
      const pageResponse = await ApiLoadBalancer.Logs.$Id.get(
        {
          loadBalancerId,
          limit: LOG_DOWNLOAD_PAGE_SIZE,
          page: pageNumber,
          timeGte,
          timeLt,
        },
        { signal },
      );
      if (pageResponse.$status === 'failed') throw pageResponse.error;

      return {
        entries: toLogEntryInputs(pageResponse),
        hasMore: pageResponse.has_more === true,
        total: pageResponse.total,
      };
    },
    [loadBalancerId, timeGte, timeLt],
  );

  const download = useLogDownload({
    name: domain ?? 'load-balancer',
    timeGte,
    timeLt,
    fetchPage,
  });

  const handleRefresh = () => {
    setAnchor(Date.now());
    setPage(1);
    refresh();
  };

  return (
    <LogsPanel
      icon={NetworkIcon}
      title={tLogs('loadBalancerTitle')}
      description={tLogs('loadBalancerSubtitle')}
      source={
        domain && (
          <span
            className="inline-flex h-9 max-w-56 items-center gap-2 rounded-md border bg-background px-3 text-sm"
            title={domain}
          >
            <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{domain}</span>
          </span>
        )
      }
      status={toLogsPanelStatus(response)}
      entries={entries}
      pagination={{
        page,
        pageSize: limit,
        hasMore: data?.has_more === true,
        totalLines: data?.total,
        onPageChange: setPage,
      }}
      download={{
        progress: download.progress,
        canDownloadAll: canDownloadAllLogs(data?.total),
        onDownloadPage: () => download.downloadPage(entryInputs, page),
        onDownloadAll: download.downloadAll,
        onCancel: download.cancel,
      }}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      query={data?.query}
      queryErrors={data?.query_errors ?? undefined}
      isRefreshing={response.$status === 'loading'}
      emptyTitle={tLogs('loadBalancerEmpty')}
      emptyDescription={tLogs('loadBalancerEmptyHint')}
      scrollResetKey={`${logTimeRangeKey(timeRange)}:${page}`}
      onRefresh={handleRefresh}
      onTimeRangeChange={(next) => {
        setTimeRange(next);
        setAnchor(Date.now());
        setPage(1);
      }}
    />
  );
}

function toLogEntryInputs(
  data: DTOs.LoadBalancerLogsV2 | undefined,
): LogEntryInput[] {
  if (data?.entries?.length) {
    return data.entries.map((entry) => ({
      line: entry.line ?? '',
      severity: entry.severity ?? undefined,
      time: entry.time == null ? undefined : String(entry.time),
    }));
  }

  return (data?.lines ?? [])
    .filter((line): line is string => typeof line === 'string')
    .map((line) => ({ line }));
}
