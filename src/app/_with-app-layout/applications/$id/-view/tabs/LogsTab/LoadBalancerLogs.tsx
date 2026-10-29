import { useMemo, useState } from 'react';

import { GlobeIcon, NetworkIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ApiLoadBalancer } from '@/shared/api';

import { toParsedLogLines } from '../../../-lib/log-entries';
import type { LogEntryInput } from '../../../-lib/log-entries';
import {
  DEFAULT_LOG_TIME_RANGE,
  formatUtcOffset,
  logTimeRangeKey,
  resolveLogTimeRange,
} from '../../../-lib/log-time-range';
import type { LogTimeRange } from '../../../-lib/log-time-range';
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
  const [anchor, setAnchor] = useState(() => Date.now());
  const [timeZoneLabel] = useState(() => formatUtcOffset(Date.now()));

  const { limit, timeGte, timeLt } = resolveLogTimeRange(timeRange, anchor);

  const [response, refresh] = ApiLoadBalancer.Logs.$Id.useGet({
    loadBalancerId,
    limit,
    timeGte,
    timeLt,
  });

  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading' && response.prevData
        ? response.prevData
        : undefined;

  const entries = useMemo(() => {
    const inputs: LogEntryInput[] = data?.entries?.length
      ? data.entries.map((entry) => ({
          line: entry.line ?? '',
          severity: entry.severity ?? undefined,
          time: entry.time == null ? undefined : String(entry.time),
        }))
      : (data?.lines ?? [])
          .filter((line): line is string => typeof line === 'string')
          .map((line) => ({ line }));

    return toParsedLogLines(inputs, {
      fallbackSource: tLogs('loadBalancer'),
      locale,
      nowMs: anchor,
    });
  }, [anchor, data, locale, tLogs]);

  const handleRefresh = () => {
    setAnchor(Date.now());
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
      lineLimit={limit}
      timeRange={timeRange}
      timeZoneLabel={timeZoneLabel}
      query={data?.query}
      queryErrors={data?.query_errors ?? undefined}
      isRefreshing={response.$status === 'loading'}
      emptyTitle={tLogs('loadBalancerEmpty')}
      emptyDescription={tLogs('loadBalancerEmptyHint')}
      scrollResetKey={logTimeRangeKey(timeRange)}
      onRefresh={handleRefresh}
      onTimeRangeChange={(next) => {
        setTimeRange(next);
        setAnchor(Date.now());
      }}
    />
  );
}
