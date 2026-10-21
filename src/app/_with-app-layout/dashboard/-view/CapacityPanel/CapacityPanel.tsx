import { Link } from '@tanstack/react-router';
import {
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  RefreshCwIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { cn } from '@/shared/libs/tailwind/cn';

import {
  CAPACITY_PRESSURE_PERCENT,
  buildCapacityReport,
} from '../../-lib/capacity';
import type { CapacityMetric, CapacityMetricReport } from '../../-lib/capacity';
import { formatPercent } from '../../-lib/percent';
import type { TelemetrySample } from '../../-lib/telemetry';
import { toneClass } from '../../-lib/tone';
import type { Tone } from '../../-lib/tone';
import { DashboardSection } from '../../-presentation';

export interface CapacityPanelProps {
  samples: TelemetrySample[];
  /** Ready servers this page is probing. */
  sampledServerCount: number;
  /** Ready servers in the workspace, which may exceed the probed ones. */
  totalReadyServers: number;
  /** How often each probed server is re-read. */
  pollSeconds: number;
  onRetry: () => void;
}

/**
 * Worst-case capacity. A fleet average hides the one server at 98%, so this
 * panel reports how many servers are over the line and names them.
 */
export default function CapacityPanel(props: CapacityPanelProps) {
  const {
    onRetry,
    pollSeconds,
    sampledServerCount,
    samples,
    totalReadyServers,
  } = props;
  const t = useDevetekTranslations('page.dashboard.capacity');

  const reachable = samples.filter((sample) => !sample.unreachable);
  const reports = buildCapacityReport(reachable);

  return (
    <DashboardSection
      title={t('title')}
      description={t('description', {
        threshold: CAPACITY_PRESSURE_PERCENT,
      })}
      action={
        <span className="text-xs font-medium text-muted-foreground">
          {t('coverage', {
            sampled: sampledServerCount,
            total: totalReadyServers,
            seconds: pollSeconds,
          })}
        </span>
      }
    >
      <CapacityBody
        reports={reports}
        samples={samples}
        reachableCount={reachable.length}
        sampledServerCount={sampledServerCount}
        totalReadyServers={totalReadyServers}
        onRetry={onRetry}
      />
    </DashboardSection>
  );
}

function CapacityBody(props: {
  reports: CapacityMetricReport[];
  samples: TelemetrySample[];
  reachableCount: number;
  sampledServerCount: number;
  totalReadyServers: number;
  onRetry: () => void;
}) {
  const {
    onRetry,
    reachableCount,
    reports,
    sampledServerCount,
    samples,
    totalReadyServers,
  } = props;
  const t = useDevetekTranslations('page.dashboard.capacity');

  if (!totalReadyServers) {
    return (
      <ServerManagementState
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    );
  }

  if (!samples.length) {
    return <ServerManagementState state="loading" title={t('loadingTitle')} />;
  }

  if (!reachableCount) {
    return (
      <ServerManagementState
        state="failed"
        title={t('failedTitle')}
        description={t('failedDescription')}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-primary transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <RefreshCwIcon className="size-3.5" />
            {t('retry')}
          </button>
        }
      />
    );
  }

  const unreachableCount = samples.length - reachableCount;

  return (
    <div className="grid gap-3">
      {reports.map((report) => (
        <CapacityMetricRow key={report.metric} report={report} />
      ))}

      {unreachableCount > 0 && (
        <p className="text-xs font-medium text-muted-foreground">
          {t('unreachable', { count: unreachableCount })}
        </p>
      )}

      {totalReadyServers > sampledServerCount && (
        <p className="text-xs text-muted-foreground">
          {t('coverageNote', {
            sampled: sampledServerCount,
            total: totalReadyServers,
          })}
        </p>
      )}

      <details>
        <summary className="cursor-pointer text-xs font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
          {t('technicalDetails')}
        </summary>
        <div className="mt-2 grid gap-1 rounded-lg border bg-background px-3 py-2">
          {samples.map((sample) => (
            <div
              key={sample.serverId}
              className="flex min-w-0 items-baseline justify-between gap-3 text-xs"
            >
              <span className="min-w-0 truncate font-medium text-primary">
                {sample.serverName}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {sample.unreachable
                  ? t('noReadings')
                  : [
                      `${t('metric.memory')} ${formatPercent(sample.memory)}`,
                      `${t('metric.cpu')} ${formatPercent(sample.cpu)}`,
                      `${t('metric.disk')} ${formatPercent(sample.disk)}`,
                    ].join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function CapacityMetricRow(props: { report: CapacityMetricReport }) {
  const { report } = props;
  const t = useDevetekTranslations('page.dashboard.capacity');

  const { icon: Icon, tone } = metricPresentation(report.metric, report);
  const metricLabel = t(`metric.${report.metric}`);
  const isPressured = report.pressured.length > 0;

  const headline = isPressured
    ? t('pressured', {
        count: report.pressured.length,
        total: report.reporting,
        metric: metricLabel,
        threshold: CAPACITY_PRESSURE_PERCENT,
      })
    : report.reporting
      ? t('comfortable', {
          total: report.reporting,
          metric: metricLabel,
          threshold: CAPACITY_PRESSURE_PERCENT,
        })
      : t('noReading', { metric: metricLabel });

  return (
    <article className="rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-primary">{headline}</p>

          {!isPressured && report.highest && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('highest', {
                server: report.highest.serverName,
                value: Math.round(report.highest.value),
              })}
            </p>
          )}

          {isPressured && (
            <ul className="mt-2 grid gap-1.5">
              {report.pressured.map((reading) => (
                <li key={reading.serverId}>
                  <Link
                    to="/servers/$id"
                    params={{ id: reading.serverId }}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-md border bg-card px-2.5 py-1.5 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                  >
                    <span className="min-w-0 truncate text-xs font-semibold text-primary">
                      {reading.serverName}
                    </span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-destructive">
                      {formatPercent(reading.value)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

function metricPresentation(
  metric: CapacityMetric,
  report: CapacityMetricReport,
): { icon: LucideIcon; tone: Tone } {
  const tone: Tone = report.pressured.length
    ? 'red'
    : report.reporting
      ? 'green'
      : 'slate';

  switch (metric) {
    case 'memory':
      return { icon: MemoryStickIcon, tone };
    case 'cpu':
      return { icon: CpuIcon, tone };
    default:
      return { icon: HardDriveIcon, tone };
  }
}
