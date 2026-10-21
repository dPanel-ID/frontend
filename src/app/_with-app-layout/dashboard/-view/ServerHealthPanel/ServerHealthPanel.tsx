import { useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

import type { buildServerStats } from '../../-lib/stats';
import type { TelemetryPoint } from '../../-lib/telemetry';
import {
  DashboardSection,
  EmptyLine,
  MeterRow,
  StatusMetric,
} from '../../-presentation';

export default function ServerHealthPanel(props: {
  totalServers?: number;
  stats: ReturnType<typeof buildServerStats>;
  servers: DTOs.MachineV1[];
  latestTelemetry: Record<string, TelemetryPoint>;
}) {
  const { latestTelemetry, servers, stats, totalServers } = props;
  const t = useDevetekTranslations('page.dashboard.serverHealth');

  const providerBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const server of servers) {
      const provider = server.provider || server.source || t('unknownProvider');
      counts.set(provider, (counts.get(provider) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [servers, t]);
  const telemetryCount = Object.keys(latestTelemetry).length;
  const primaryProvider = providerBreakdown[0];
  const readinessPercent = totalServers
    ? Math.round((stats.ready / totalServers) * 100)
    : 0;
  const insightItems = [
    totalServers
      ? stats.attention > 0
        ? t('insightAttention', { count: stats.attention })
        : t('insightHealthy', { percent: readinessPercent })
      : t('insightNoServers'),
    stats.progress > 0
      ? t('insightProgress', { count: stats.progress })
      : t('insightNoProgress'),
    stats.ready > 0
      ? t('insightTelemetry', {
          sampled: telemetryCount,
          total: stats.ready,
        })
      : t('insightNoTelemetry'),
    primaryProvider
      ? t('insightProvider', {
          provider: primaryProvider[0],
          count: primaryProvider[1],
          total: servers.length,
        })
      : t('insightNoProvider'),
  ];

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <Link
          to="/servers"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewServers')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.48fr)]">
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <StatusMetric
              icon={CheckCircle2Icon}
              label={t('ready')}
              helper={t('readyHelp')}
              value={stats.ready}
              tone="green"
              total={totalServers}
            />
            <StatusMetric
              icon={RefreshCwIcon}
              label={t('progress')}
              helper={t('progressHelp')}
              value={stats.progress}
              tone="blue"
              total={totalServers}
            />
            <StatusMetric
              icon={AlertTriangleIcon}
              label={t('attention')}
              helper={t('attentionHelp')}
              value={stats.attention}
              tone="amber"
              total={totalServers}
            />
            <StatusMetric
              icon={ActivityIcon}
              label={t('withTelemetry')}
              helper={t('telemetryHelp')}
              value={telemetryCount}
              tone="violet"
              total={stats.ready}
            />
          </div>

          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('insightTitle')}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {insightItems.map((item) => (
                <div
                  key={item}
                  className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span className="min-w-0">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t('providerMix')}
          </p>
          <div className="mt-3 grid gap-2">
            {providerBreakdown.length ? (
              providerBreakdown.map(([provider, count]) => (
                <MeterRow
                  key={provider}
                  label={provider}
                  value={count}
                  total={servers.length}
                />
              ))
            ) : (
              <EmptyLine>{t('emptyProviders')}</EmptyLine>
            )}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
