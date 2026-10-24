import { useState } from 'react';

import { Clock3Icon, GlobeIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiLoadBalancer } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { FailedState } from '@/widgets/failed-state';

import { APP_LOG_TIME_FILTERS } from '../../../-model/app-logs';
import type { AppLogTimeFilter } from '../../../-model/app-logs';
import LogViewer from '../../AppLogs/_presentation/LogViewer';

interface LoadBalancerLogsProps {
  loadBalancerId: string;
  domain?: string;
}

const TIME_FILTERS: AppLogTimeFilter[] = ['10m', '1h'];

/**
 * Requests reaching the load balancer in front of this application, in the
 * same viewer the runtime logs use so the two read alike.
 */
export default function LoadBalancerLogs(props: LoadBalancerLogsProps) {
  const { domain, loadBalancerId } = props;

  const t = useDevetekTranslations('page.applicationDetail.appLogs');
  const tLogs = useDevetekTranslations('page.applicationDetail.logs');

  const [timeFilter, setTimeFilter] = useState<AppLogTimeFilter>('10m');
  const [anchor, setAnchor] = useState(() => Date.now());

  const config = APP_LOG_TIME_FILTERS[timeFilter];

  const [response, refresh] = ApiLoadBalancer.Logs.$Id.useGet({
    loadBalancerId,
    limit: config.limit,
    timeGte: new Date(anchor - config.durationMs).toISOString(),
    timeLt: new Date(anchor).toISOString(),
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

          <div
            aria-label={t('timeRangeLabel')}
            className="inline-flex h-8 items-center rounded-md border bg-background p-0.5"
            role="group"
          >
            <Clock3Icon className="mx-2 size-4 text-muted-foreground" />
            {TIME_FILTERS.map((one) => {
              const isActive = timeFilter === one;

              return (
                <button
                  key={one}
                  type="button"
                  aria-pressed={isActive}
                  className={cn(
                    'h-6 rounded-sm px-2 text-xs font-medium transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => {
                    setTimeFilter(one);
                    setAnchor(Date.now());
                  }}
                >
                  {t(one === '10m' ? 'tenMinutes' : 'oneHour')}
                </button>
              );
            })}
          </div>

          <span className="h-8 rounded-md border bg-background px-2 text-xs font-medium leading-8 text-muted-foreground">
            {t('lineWindow', { count: lines.length, limit: config.limit })}
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
            scrollResetKey={`${timeFilter}:${lines.length}`}
          />
        )}
      </div>
    </Card>
  );
}
