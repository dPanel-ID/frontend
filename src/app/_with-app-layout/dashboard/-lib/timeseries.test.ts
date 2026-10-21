import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  buildActivitySeries,
  successRate,
  trimLeadingQuiet,
} from './timeseries';
import type { ActivityPoint } from './timeseries';

function point(
  timestamp: string,
  overrides: Partial<DTOs.ExecutionTimeseriesPointV2> = {},
): DTOs.ExecutionTimeseriesPointV2 {
  return { timestamp, ...overrides };
}

describe('buildActivitySeries', () => {
  it('reshapes points and totals them', () => {
    const series = buildActivitySeries({
      bucket: 'hour',
      points: [
        point('2026-10-21T19:00:00Z', { succeeded: 3, failed: 1, total: 4 }),
        point('2026-10-21T20:00:00Z', { succeeded: 6, total: 6 }),
      ],
    });

    expect(series.total).toBe(10);
    expect(series.succeeded).toBe(9);
    expect(series.failed).toBe(1);
    expect(series.peak).toBe(6);
    expect(series.bucket).toBe('hour');
    expect(series.isEmpty).toBe(false);
    expect(series.points).toHaveLength(2);
  });

  it('folds cancelled, running, pending and legacy states into one residual', () => {
    const series = buildActivitySeries({
      points: [
        point('2026-10-21T19:00:00Z', {
          cancelled: 1,
          running: 2,
          pending: 3,
          other: 4,
          total: 10,
        }),
      ],
    });

    const [first] = series.points;
    expect(first?.other).toBe(10);
    expect(first?.succeeded).toBe(0);
    expect(first?.failed).toBe(0);
  });

  it('derives a point total when the API omits it', () => {
    const series = buildActivitySeries({
      points: [point('2026-10-21T19:00:00Z', { succeeded: 2, failed: 1 })],
    });

    expect(series.points[0]?.total).toBe(3);
    expect(series.total).toBe(3);
  });

  it('orders points oldest first even if the API does not', () => {
    const series = buildActivitySeries({
      points: [
        point('2026-10-21T20:00:00Z', { total: 1 }),
        point('2026-10-21T19:00:00Z', { total: 1 }),
      ],
    });

    expect(series.points[0]?.time).toBeLessThan(series.points[1]?.time ?? 0);
  });

  it('skips points with an unparseable timestamp rather than plotting NaN', () => {
    const series = buildActivitySeries({
      points: [
        point('not-a-time', { total: 5 }),
        point('2026-10-21T19:00:00Z', { succeeded: 1, total: 1 }),
      ],
    });

    expect(series.points).toHaveLength(1);
    expect(series.total).toBe(1);
  });

  it('reports an empty window as empty rather than as all-zero activity', () => {
    const series = buildActivitySeries({
      bucket: 'day',
      points: [point('2026-10-20T00:00:00Z'), point('2026-10-21T00:00:00Z')],
    });

    expect(series.isEmpty).toBe(true);
    expect(series.total).toBe(0);
    // The buckets are still returned so the chart can draw an axis.
    expect(series.points).toHaveLength(2);
  });

  it('survives a missing or empty payload', () => {
    for (const series of [
      buildActivitySeries(undefined),
      buildActivitySeries({}),
      buildActivitySeries({ points: [] }),
    ]) {
      expect(series.isEmpty).toBe(true);
      expect(series.points).toEqual([]);
      expect(series.successRate).toBeUndefined();
    }
  });
});

describe('successRate', () => {
  it('measures finished work only', () => {
    expect(successRate(9, 1)).toBe(90);
    expect(successRate(1, 1)).toBe(50);
    expect(successRate(0, 4)).toBe(0);
  });

  it('is undefined when nothing has finished, which is not the same as 0%', () => {
    expect(successRate(0, 0)).toBeUndefined();
  });

  it('never exceeds 100 or reports a fraction', () => {
    const rate = successRate(7, 3);
    expect(rate).toBe(70);
    expect(Number.isInteger(rate)).toBe(true);
  });
});

describe('trimLeadingQuiet', () => {
  const points = (totals: number[]): ActivityPoint[] =>
    totals.map((total, index) => ({
      time: index * 3_600_000,
      succeeded: total,
      failed: 0,
      other: 0,
      total,
    }));

  it('trims a long quiet run so the chart opens on the active period', () => {
    const trimmed = trimLeadingQuiet(points([0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 7]));

    expect(trimmed.length).toBeLessThan(11);
    expect(trimmed.at(-1)?.total).toBe(7);
  });

  it('keeps a little quiet context before the first activity', () => {
    const trimmed = trimLeadingQuiet(points([0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 7]));

    // The rise must read as a rise, so the bucket before it is kept.
    expect(trimmed[0]?.total).toBe(0);
  });

  it('never trims below the minimum so one bar is not left without context', () => {
    const trimmed = trimLeadingQuiet(
      points([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9]),
      8,
    );

    expect(trimmed.length).toBeGreaterThanOrEqual(8);
  });

  it('leaves a short series alone', () => {
    const input = points([0, 0, 3]);
    expect(trimLeadingQuiet(input)).toEqual(input);
  });

  it('leaves an all-quiet series alone rather than trimming it to nothing', () => {
    const input = points([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(trimLeadingQuiet(input)).toEqual(input);
  });

  it('leaves a series that is active from its first bucket alone', () => {
    const input = points([4, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(trimLeadingQuiet(input)).toEqual(input);
  });
});
