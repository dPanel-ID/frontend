import { useMemo, useState } from 'react';

import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { CpuIcon, HardDriveIcon, MemoryStickIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';

import { useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { ApiMetrics } from '@/shared/api';
import SegmentedControl from '@/shared/presentation/atoms/SegmentedControl';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

import {
  FLEET_RESOURCES,
  buildFleetSeries,
  fleetSeverity,
} from '../../-lib/fleet-utilisation';
import type {
  FleetResource,
  FleetResourceSeries,
  FleetSeverity,
} from '../../-lib/fleet-utilisation';
import { DashboardSection } from '../../-presentation';

import {
  FLEET_AVERAGE_COLOR,
  fleetChartOptions,
  fleetPeakColor,
  isolatedPointRadius,
} from './chart-options';

/**
 * Ranges offered for resource history. Rollups are kept for 30 days, but the
 * opening set stays short because that is the span an operator reads: a day
 * tells you what is happening, a month tells you what it costs.
 */
const FLEET_RANGES = {
  '1h': { since: '1h', labelKey: 'range.hour' },
  '24h': { since: '24h', labelKey: 'range.day' },
  '3d': { since: '72h', labelKey: 'range.threeDays' },
} as const;

type FleetRangeId = keyof typeof FLEET_RANGES;

const DEFAULT_FLEET_RANGE: FleetRangeId = '24h';

const RESOURCE_ICONS: Record<FleetResource, LucideIcon> = {
  cpu: CpuIcon,
  memory: MemoryStickIcon,
  disk: HardDriveIcon,
};

/**
 * How hard the fleet is working, over time. Three small charts rather than one
 * combined: each plots its own resource with the fleet average and the
 * busiest server, the one with the highest average over the selected range.
 * The dotted line, the server named under the chart and the numbers beside it
 * all describe that one server.
 */
export default function FleetUtilisationPanel() {
  const t = useDevetekTranslations('page.dashboard.fleet');
  const [range, setRange] = useState<FleetRangeId>(DEFAULT_FLEET_RANGE);

  const [response, refresh] = ApiMetrics.FleetUtilisation.useGet({
    since: FLEET_RANGES[range].since,
  });

  const series = useMemo(
    () =>
      buildFleetSeries(response.$status === 'success' ? response : undefined),
    [response],
  );

  const isLoading =
    response.$status === 'initial' || response.$status === 'loading';
  const hasFailed = response.$status === 'failed';

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <FleetLegend />
          <SegmentedControl
            activeItemId={range}
            onClickOption={setRange}
            options={(Object.keys(FLEET_RANGES) as FleetRangeId[]).map(
              (id) => ({
                id,
                text: t(FLEET_RANGES[id].labelKey),
              }),
            )}
          />
        </div>
      }
    >
      {hasFailed ? (
        <ServerManagementState
          state="failed"
          title={t('failedTitle')}
          description={t('failedDescription')}
          action={
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-primary transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              {t('retry')}
            </button>
          }
        />
      ) : isLoading && !series.hasData ? (
        <div className="grid gap-3">
          {FLEET_RESOURCES.map((resource) => (
            <div
              key={resource}
              className="h-64 animate-pulse rounded-lg border bg-background"
            />
          ))}
        </div>
      ) : !series.hasData ? (
        <ServerManagementState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      ) : (
        <div className="grid gap-3">
          {FLEET_RESOURCES.map((resource) => (
            <FleetResourceCard
              key={resource}
              series={series.resources[resource]}
              bucket={series.bucket}
            />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

/** Legend in the card header, so identity is never colour-alone. */
function FleetLegend() {
  const t = useDevetekTranslations('page.dashboard.fleet');

  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <li className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span
          aria-hidden
          className="h-0.5 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: FLEET_AVERAGE_COLOR }}
        />
        {t('legend.average')}
      </li>
      <li className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span
          aria-hidden
          className="h-0 w-4 shrink-0 border-t-2 border-dashed"
          style={{ borderColor: FLEET_AVERAGE_COLOR }}
        />
        {t('legend.busiest')}
      </li>
    </ul>
  );
}

function FleetResourceCard(props: {
  series: FleetResourceSeries;
  bucket: 'hour' | 'day';
}) {
  const { bucket, series } = props;
  const t = useDevetekTranslations('page.dashboard.fleet');
  const Icon = RESOURCE_ICONS[series.resource];

  const { busiest } = series;
  const severity = fleetSeverity(busiest?.peak);
  const peakColor = fleetPeakColor(severity);
  const labelFor = useMemo(() => bucketLabeller(bucket), [bucket]);
  // The tooltip names the server, so the line and the note below can never
  // be read as two different servers.
  const busiestLabel = busiest
    ? busiest.hostname || t('unknownServer')
    : t('legend.busiest');

  const data = useMemo(
    () => ({
      labels: series.points.map((point) => labelFor(point.time)),
      datasets: [
        {
          label: busiestLabel,
          data: series.points.map((point) => point.busiest),
          borderColor: peakColor,
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          pointRadius: isolatedPointRadius,
          pointBackgroundColor: peakColor,
          // A bucket nobody reported in breaks the line instead of diving to 0.
          spanGaps: false,
        },
        {
          label: t('legend.average'),
          data: series.points.map((point) => point.avg),
          borderColor: FLEET_AVERAGE_COLOR,
          backgroundColor: 'rgba(2, 132, 199, 0.12)',
          fill: true,
          pointRadius: isolatedPointRadius,
          pointBackgroundColor: FLEET_AVERAGE_COLOR,
          spanGaps: false,
        },
      ],
    }),
    [busiestLabel, labelFor, peakColor, series.points, t],
  );

  const options = useMemo(
    () =>
      fleetChartOptions((index) => {
        const point = series.points[index];
        return point ? labelFor(point.time, 'long') : '';
      }),
    [labelFor, series.points],
  );

  return (
    // min-w-0: a grid item is as wide as its widest unbroken line by default,
    // and the busiest server's name (truncated below) is long enough to push
    // the page sideways on a phone.
    <section className="min-w-0 rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-primary/70"
          >
            <Icon className="size-3.5" />
          </span>
          <h3 className="truncate text-sm font-bold text-primary">
            {t(`resource.${series.resource}`)}
          </h3>
        </div>
        <p className="shrink-0 text-lg font-bold tabular-nums leading-none text-primary">
          {series.currentAvg == null
            ? '—'
            : `${Math.round(series.currentAvg)}%`}
        </p>
      </div>

      {/* One resource per row, so each chart gets the panel's full width. */}
      <div className="mt-3 h-48">
        <Line
          data={data}
          options={options}
          aria-label={t('chartAria', {
            resource: t(`resource.${series.resource}`),
          })}
        />
      </div>

      <FleetBusiestNote series={series} severity={severity} />

      {/*
        The same numbers as text: a canvas is unreadable to a screen reader,
        and this also covers print and forced colours.
      */}
      <div className="sr-only">
        <table>
          <caption>
            {t('tableCaption', { resource: t(`resource.${series.resource}`) })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('tableWhen')}</th>
              <th scope="col">{t('legend.average')}</th>
              <th scope="col">{busiestLabel}</th>
            </tr>
          </thead>
          <tbody>
            {series.points.map((point) => (
              <tr key={point.time}>
                <th scope="row">{labelFor(point.time, 'long')}</th>
                <td>
                  {point.avg == null
                    ? t('noReading')
                    : `${Math.round(point.avg)}%`}
                </td>
                <td>
                  {point.busiest == null
                    ? t('noReading')
                    : `${Math.round(point.busiest)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Names the busiest server and quotes its own average and peak for the range,
 * so every number here belongs to the dotted line above it.
 */
function FleetBusiestNote(props: {
  series: FleetResourceSeries;
  severity: FleetSeverity;
}) {
  const { series, severity } = props;
  const t = useDevetekTranslations('page.dashboard.fleet');
  const { busiest } = series;

  if (!busiest) {
    return (
      <p className="mt-2 truncate text-xs text-muted-foreground">
        {t('noBusiest')}
      </p>
    );
  }

  const tone: StatusTone =
    severity === 'critical'
      ? 'danger'
      : severity === 'warning'
        ? 'warning'
        : 'neutral';
  const hostname = busiest.hostname || t('unknownServer');

  return (
    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <StatusPill
        tone={tone}
        label={t('peakPercent', { percent: Math.round(busiest.peak) })}
      />
      <Link
        to="/servers/$id"
        params={{ id: busiest.machineId }}
        className="min-w-0 truncate text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        title={hostname}
      >
        {hostname}
      </Link>
      <span className="text-xs text-muted-foreground">
        {t('busiestAverage', { percent: Math.round(busiest.average) })}
      </span>
    </div>
  );
}

/**
 * Axis and tooltip labels. Hourly buckets show the clock, daily buckets the
 * date; the long form adds the other half for the tooltip, where there is
 * room to be unambiguous.
 */
function bucketLabeller(bucket: 'hour' | 'day') {
  return (time: number, form: 'short' | 'long' = 'short') => {
    const at = dayjs(time);
    if (bucket === 'hour') {
      return form === 'long' ? at.format('D MMM, HH:mm') : at.format('HH:mm');
    }
    return form === 'long' ? at.format('dddd D MMMM') : at.format('D MMM');
  };
}
