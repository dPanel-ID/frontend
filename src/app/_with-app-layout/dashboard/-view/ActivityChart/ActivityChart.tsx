import { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { ActivityIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

import { useDevetekTranslations } from '@/services/i18n';

import { ServerManagementState } from '@/features/server-management-sidepanel-ui';

import { ApiExecution } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import SegmentedControl from '@/shared/presentation/atoms/SegmentedControl';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import type { StatTileTone } from '@/shared/presentation/molecules/StatTile';

import { buildActivitySeries, trimLeadingQuiet } from '../../-lib/timeseries';
import type { ActivitySeries } from '../../-lib/timeseries';
import { DashboardSection } from '../../-presentation';

import {
  ACTIVITY_COLORS,
  ACTIVITY_SEGMENT_BORDER,
  activityChartOptions,
} from './chart-options';

/**
 * The ranges a reader can pick between. Activity on this platform is bursty —
 * a quiet fortnight and then a busy afternoon — so a single fixed window
 * either hides the detail of a busy day or draws a fortnight of empty
 * buckets. Letting the range be chosen is the honest answer, and it is what
 * an operations overview wants anyway.
 */
const ACTIVITY_RANGES = {
  '24h': { since: '24h', labelKey: 'range.day' },
  '7d': { since: '168h', labelKey: 'range.week' },
  '30d': { since: '720h', labelKey: 'range.month' },
} as const;

type ActivityRangeId = keyof typeof ACTIVITY_RANGES;

const DEFAULT_ACTIVITY_RANGE: ActivityRangeId = '7d';

/**
 * What the platform has been doing, over time. The headline numbers answer
 * "how much, and how much went wrong"; the chart shows when.
 */
export default function ActivityChart() {
  const t = useDevetekTranslations('page.dashboard.activityChart');
  const [range, setRange] = useState<ActivityRangeId>(DEFAULT_ACTIVITY_RANGE);

  const [response, refresh] = ApiExecution.Timeseries.useGet({
    since: ACTIVITY_RANGES[range].since,
  });

  const series = useMemo(
    () =>
      buildActivitySeries(
        response.$status === 'success' ? response : undefined,
      ),
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
          <ActivityLegend />
          <SegmentedControl
            activeItemId={range}
            onClickOption={setRange}
            options={(Object.keys(ACTIVITY_RANGES) as ActivityRangeId[]).map(
              (id) => ({
                id,
                text: t(ACTIVITY_RANGES[id].labelKey),
                tooltipText: t('rangeTooltip', {
                  range: t(ACTIVITY_RANGES[id].labelKey),
                }),
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
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(208px,0.3fr)]">
          <ActivityPlot series={series} isLoading={isLoading} />
          <ActivityHeadlines series={series} isLoading={isLoading} />
        </div>
      )}
    </DashboardSection>
  );
}

/**
 * The legend lives in the card header rather than on the canvas, so identity
 * is never colour-alone while the plot keeps its full height.
 */
function ActivityLegend() {
  const t = useDevetekTranslations('page.dashboard.activityChart');

  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {(
        [
          ['succeeded', ACTIVITY_COLORS.succeeded],
          ['failed', ACTIVITY_COLORS.failed],
          ['other', ACTIVITY_COLORS.other],
        ] as const
      ).map(([key, color]) => (
        <li
          key={key}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: color }}
          />
          {t(`legend.${key}`)}
        </li>
      ))}
    </ul>
  );
}

function ActivityPlot(props: { series: ActivitySeries; isLoading: boolean }) {
  const { isLoading, series } = props;
  const t = useDevetekTranslations('page.dashboard.activityChart');

  const points = useMemo(
    () => trimLeadingQuiet(series.points),
    [series.points],
  );
  const labelFor = useMemo(
    () => bucketLabeller(series.bucket),
    [series.bucket],
  );

  const data = useMemo(
    () => ({
      labels: points.map((point) => labelFor(point.time)),
      datasets: [
        {
          label: t('legend.succeeded'),
          data: points.map((point) => point.succeeded),
          backgroundColor: ACTIVITY_COLORS.succeeded,
          ...ACTIVITY_SEGMENT_BORDER,
        },
        {
          label: t('legend.failed'),
          data: points.map((point) => point.failed),
          backgroundColor: ACTIVITY_COLORS.failed,
          ...ACTIVITY_SEGMENT_BORDER,
        },
        {
          label: t('legend.other'),
          data: points.map((point) => point.other),
          backgroundColor: ACTIVITY_COLORS.other,
          ...ACTIVITY_SEGMENT_BORDER,
        },
      ],
    }),
    [labelFor, points, t],
  );

  const options = useMemo(
    () =>
      activityChartOptions((index) => {
        const point = points[index];
        return point ? labelFor(point.time, 'long') : '';
      }),
    [labelFor, points],
  );

  if (isLoading && !points.length) {
    return (
      <div className="h-56 animate-pulse rounded-lg border bg-background" />
    );
  }

  if (series.isEmpty) {
    return (
      <ServerManagementState
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    );
  }

  return (
    <figure className="m-0">
      <div className="h-56 rounded-lg border bg-background p-3">
        <Bar data={data} options={options} aria-label={t('chartAria')} />
      </div>

      {/*
        The same numbers as a table: the chart is canvas, so a screen reader
        and a forced-colours or print reader need the values in text.
      */}
      <figcaption className="sr-only">
        <table>
          <caption>{t('tableCaption')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('tableWhen')}</th>
              <th scope="col">{t('legend.succeeded')}</th>
              <th scope="col">{t('legend.failed')}</th>
              <th scope="col">{t('legend.other')}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.time}>
                <th scope="row">{labelFor(point.time, 'long')}</th>
                <td>{point.succeeded}</td>
                <td>{point.failed}</td>
                <td>{point.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** The numbers an executive reader takes away without reading the plot. */
function ActivityHeadlines(props: {
  series: ActivitySeries;
  isLoading: boolean;
}) {
  const { isLoading, series } = props;
  const t = useDevetekTranslations('page.dashboard.activityChart');

  const tiles: Array<{
    key: string;
    icon: LucideIcon;
    label: string;
    value: string;
    hint: string;
    tone: StatTileTone;
  }> = [
    {
      key: 'total',
      icon: ActivityIcon,
      label: t('totalLabel'),
      value: String(series.total),
      hint: t('totalHint'),
      tone: 'sky',
    },
    {
      key: 'successRate',
      icon: CheckCircle2Icon,
      label: t('successRateLabel'),
      // Nothing finished is not the same claim as 0%, so it stays a dash.
      value: series.successRate == null ? '—' : `${series.successRate}%`,
      hint: t('successRateHint'),
      tone: successRateTone(series.successRate),
    },
    {
      key: 'failed',
      icon: XCircleIcon,
      label: t('failedLabel'),
      value: String(series.failed),
      hint: t('failedHint'),
      tone: series.failed > 0 ? 'red' : 'neutral',
    },
  ];

  return (
    <div className="grid content-start gap-2">
      {tiles.map((tile) => (
        <StatTile
          key={tile.key}
          icon={tile.icon}
          label={tile.label}
          value={tile.value}
          hint={tile.hint}
          tone={tile.tone}
          loading={isLoading}
          className={cn('bg-background')}
        />
      ))}
    </div>
  );
}

/**
 * Tone for a success rate. Anything short of near-perfect is worth noticing
 * on an operations dashboard, so the band is deliberately tight; an unknown
 * rate stays neutral rather than being coloured as good or bad.
 */
function successRateTone(rate?: number): StatTileTone {
  if (rate == null) return 'neutral';
  if (rate >= 95) return 'emerald';
  if (rate >= 80) return 'amber';
  return 'red';
}

/**
 * Axis and tooltip labels for a bucket width. Hourly buckets show the clock,
 * daily buckets the date; the long form adds the other half for the tooltip,
 * where there is room to be unambiguous.
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
