import type { DTOs } from '@/shared/api';

/**
 * One plotted bucket. The API already guarantees contiguous points with empty
 * buckets filled, so this only reshapes them for the chart and folds the
 * states nobody charts separately into `other`.
 */
export interface ActivityPoint {
  /** Epoch milliseconds, for ordering and axis labels. */
  time: number;
  succeeded: number;
  failed: number;
  /** Cancelled, running, pending and legacy statuses. */
  other: number;
  total: number;
}

export interface ActivitySeries {
  points: ActivityPoint[];
  bucket: 'hour' | 'day';
  total: number;
  succeeded: number;
  failed: number;
  /** Share of finished work that succeeded, 0-100, or undefined if none finished. */
  successRate?: number;
  /** The busiest bucket's total, for sizing the axis and naming the peak. */
  peak: number;
  /** True when every bucket is empty, so the chart should not pretend to plot. */
  isEmpty: boolean;
}

const EMPTY_SERIES: ActivitySeries = {
  points: [],
  bucket: 'day',
  total: 0,
  succeeded: 0,
  failed: 0,
  successRate: undefined,
  peak: 0,
  isEmpty: true,
};

/** Reshapes the API's timeseries into the series the chart plots. */
export function buildActivitySeries(
  series?: DTOs.ExecutionTimeseriesV2,
): ActivitySeries {
  const rawPoints = series?.points ?? [];
  if (!rawPoints.length) {
    return { ...EMPTY_SERIES, bucket: series?.bucket ?? 'day' };
  }

  const points: ActivityPoint[] = [];
  let succeeded = 0;
  let failed = 0;
  let total = 0;
  let peak = 0;

  for (const raw of rawPoints) {
    const time = Date.parse(raw.timestamp);
    if (Number.isNaN(time)) continue;

    const pointSucceeded = raw.succeeded ?? 0;
    const pointFailed = raw.failed ?? 0;
    // Everything that is neither a success nor a failure is charted as one
    // neutral residual rather than given its own hue.
    const pointOther =
      (raw.cancelled ?? 0) +
      (raw.running ?? 0) +
      (raw.pending ?? 0) +
      (raw.other ?? 0);
    const pointTotal = raw.total ?? pointSucceeded + pointFailed + pointOther;

    points.push({
      time,
      succeeded: pointSucceeded,
      failed: pointFailed,
      other: pointOther,
      total: pointTotal,
    });

    succeeded += pointSucceeded;
    failed += pointFailed;
    total += pointTotal;
    peak = Math.max(peak, pointTotal);
  }

  points.sort((left, right) => left.time - right.time);

  return {
    points,
    bucket: series?.bucket ?? 'day',
    total,
    succeeded,
    failed,
    successRate: successRate(succeeded, failed),
    peak,
    isEmpty: total === 0,
  };
}

/**
 * Share of *finished* work that succeeded. Work still in flight is excluded,
 * so a long-running operation does not read as a failure while it runs.
 * Undefined when nothing has finished, because 0% and "nothing yet" are
 * different claims.
 */
export function successRate(
  succeeded: number,
  failed: number,
): number | undefined {
  const finished = succeeded + failed;
  if (finished <= 0) return undefined;
  return Math.round((succeeded / finished) * 100);
}

/**
 * The window actually worth charting. The API returns the full requested
 * window, but activity is bursty: a month of history with one busy afternoon
 * plots as a flat line and one spike. Trimming leading empty buckets lets the
 * chart open on the period that has something in it, while never trimming so
 * far that a single bucket is left with no context around it.
 */
export function trimLeadingQuiet(
  points: ActivityPoint[],
  minPoints = 8,
): ActivityPoint[] {
  if (points.length <= minPoints) return points;

  const firstActive = points.findIndex((point) => point.total > 0);
  if (firstActive <= 0) return points;

  // Keep a little quiet context before the first activity so the rise is
  // visible as a rise.
  const start = Math.min(
    Math.max(0, firstActive - 2),
    Math.max(0, points.length - minPoints),
  );
  return points.slice(start);
}
