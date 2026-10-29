import { useState } from 'react';

import { GlobeIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiLoadBalancer } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { FailedState } from '@/widgets/failed-state';

import {
  DEFAULT_LOG_TIME_RANGE,
  logTimeRangeKey,
  resolveLogTimeRange,
} from '../../../-lib/log-time-range';
import type { LogTimeRange } from '../../../-lib/log-time-range';
import LogTimeRangeMenu from '../../AppLogs/_presentation/LogTimeRangeMenu';
import LogViewer from '../../AppLogs/_presentation/LogViewer';

interface LoadBalancerLogsProps {
  loadBalancerId: string;
  domain?: string;
}

/**
 * Requests reaching the load balancer in front of this application, in the
 * same viewer the runtime logs use so the two read alike.
 */
export default function LoadBalancerLogs(props: LoadBalancerLogsProps) {
  const { domain, loadBalancerId } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const tLogs = useDevetekTranslations('page.applicationDetail.logs');

  const [timeRange, setTimeRange] = useState<LogTimeRange>(
    DEFAULT_LOG_TIME_RANGE,
  );
  const [anchor, setAnchor] = useState(() => Date.now());

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

  const lines = (data?.lines ?? []).filter(
    (line): line is string => typeof line === 'string',
  );

  const handleRefresh = () => {
    setAnchor(Date.now());
    refresh();
  };

  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold">{tLogs('loadBalancerTitle')}</h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {domain ?? tLogs('loadBalancerSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {domain && (
            <span className="inline-flex h-8 max-w-56 items-center gap-2 rounded-md border bg-background px-2 text-sm">
              <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{domain}</span>
            </span>
          )}

          <LogTimeRangeMenu
            value={timeRange}
            onChange={(next) => {
              setTimeRange(next);
              setAnchor(Date.now());
            }}
          />

          <span className="h-8 rounded-md border bg-background px-2 text-xs font-medium leading-8 text-muted-foreground">
            {t('lineWindow', { count: lines.length, limit })}
          </span>

          <Button
            size="icon-sm"
            buttonColor="secondary"
            buttonStyle="outline"
            onClick={handleRefresh}
            aria-label={t('refreshLog')}
            title={t('refreshLog')}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {response.$status === 'failed' ? (
          <FailedState.BannerRetryable onClickRetry={handleRefresh} />
        ) : (
          <LogViewer
            ariaLabel={tLogs('loadBalancerTitle')}
            emptyLabel={tLogs('loadBalancerEmpty')}
            emptyDescription={tLogs('loadBalancerEmptyHint')}
            entries={
              data?.entries?.map((entry) => ({
                line: entry.line ?? '',
                severity: entry.severity ?? undefined,
                time: entry.time == null ? undefined : String(entry.time),
              })) ?? undefined
            }
            query={data?.query}
            queryErrors={data?.query_errors ?? undefined}
            lines={lines}
            scrollResetKey={`${logTimeRangeKey(timeRange)}:${lines.length}`}
          />
        )}
      </div>
    </Card>
  );
}
