import { useCallback, useState } from 'react';

import { GlobeIcon, NetworkIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiLoadBalancer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import {
  DEFAULT_LOG_TIME_RANGE,
  InfiniteLogsPanel,
  LOG_DOWNLOAD_PAGE_SIZE,
  canDownloadAllLogs,
  formatUtcOffset,
  logEntryFields,
  resolveLogTimeRange,
  useLogDownload,
  useLogWindow,
} from '@/widgets/log-viewer';
import type {
  LogEntryInput,
  LogPageResult,
  LogTimeRange,
} from '@/widgets/log-viewer';

interface LoadBalancerLogsProps {
  loadBalancerId: string;
  domain?: string;
}

/**
 * Requests reaching the load balancer in front of this application, in the
 * same panel the runtime logs use so the two read alike.
 */
export function LoadBalancerLogs(props: LoadBalancerLogsProps) {
  const { domain, loadBalancerId } = props;

  const tLogs = useDevetekTranslations('page.applicationDetail.logs');

  const [timeRange, setTimeRange] = useState<LogTimeRange>(
    DEFAULT_LOG_TIME_RANGE,
  );
  // Pages are offsets into the window; the anchor stays put while the reader
  // scrolls, and moves to "now" on a refresh or a new range.
  const [anchor, setAnchor] = useState(() => Date.now());
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const { limit, timeGte, timeLt } = resolveLogTimeRange(timeRange, anchor);
  const windowKey = `${loadBalancerId}:${timeGte}:${timeLt}`;

  const fetchWindowPage = useCallback(
    (pageNumber: number, signal: AbortSignal) =>
      fetchLoadBalancerLogPage(
        { loadBalancerId, limit, page: pageNumber, timeGte, timeLt },
        signal,
      ),
    [limit, loadBalancerId, timeGte, timeLt],
  );
  const logWindow = useLogWindow({
    fetchPage: fetchWindowPage,
    windowKey,
  });

  const fetchDownloadPage = useCallback(
    (pageNumber: number, signal: AbortSignal) =>
      fetchLoadBalancerLogPage(
        {
          loadBalancerId,
          limit: LOG_DOWNLOAD_PAGE_SIZE,
          page: pageNumber,
          timeGte,
          timeLt,
        },
        signal,
      ),
    [loadBalancerId, timeGte, timeLt],
  );
  const download = useLogDownload({
    name: domain ?? 'load-balancer',
    timeGte,
    timeLt,
    fetchPage: fetchDownloadPage,
  });

  return (
    <InfiniteLogsPanel
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
      window={logWindow}
      windowKey={windowKey}
      pageSize={limit}
      fallbackSource={tLogs('loadBalancer')}
      nowMs={anchor}
      download={{
        progress: download.progress,
        canDownloadAll: canDownloadAllLogs(logWindow.total),
        onDownloadLoaded: (entries) => download.downloadPage(entries, 1),
        onDownloadAll: download.downloadAll,
        onCancel: download.cancel,
      }}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      emptyTitle={tLogs('loadBalancerEmpty')}
      emptyDescription={tLogs('loadBalancerEmptyHint')}
      onRefresh={() => setAnchor(Date.now())}
      onTimeRangeChange={(next) => {
        setTimeRange(next);
        setAnchor(Date.now());
      }}
    />
  );
}

/** One page of a load balancer's request log, oldest line first. */
async function fetchLoadBalancerLogPage(
  params: {
    loadBalancerId: string;
    limit: number;
    page: number;
    timeGte?: string;
    timeLt?: string;
  },
  signal: AbortSignal,
): Promise<LogPageResult> {
  const response = await ApiLoadBalancer.Logs.$Id.get(params, { signal });
  if (response.$status === 'failed') throw response.error;

  return {
    entries: toLogEntryInputs(response),
    hasMore: response.has_more === true,
    total: response.total,
    query: response.query,
    queryErrors: response.query_errors ?? undefined,
  };
}

function toLogEntryInputs(
  data: DTOs.LoadBalancerLogsV2 | undefined,
): LogEntryInput[] {
  if (data?.entries?.length) {
    return data.entries.map((entry) => {
      const stream = entry.attributes?.dpanel_attr_stream;
      return {
        line: entry.line ?? '',
        severity: entry.severity ?? undefined,
        time: entry.time == null ? undefined : String(entry.time),
        stream: typeof stream === 'string' ? stream : undefined,
        fields: logEntryFields(entry.attributes),
      };
    });
  }

  return (data?.lines ?? [])
    .filter((line): line is string => typeof line === 'string')
    .map((line) => ({ line }));
}
