import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  FLEET_RESOURCES,
  buildFleetSeries,
  fleetSeverity,
} from './fleet-utilisation';

function payload(
  overrides: Partial<DTOs.FleetUtilisationV2> = {},
): DTOs.FleetUtilisationV2 {
  return {
    bucket: 'hour',
    has_data: true,
    machines: 2,
    points: [],
    ...overrides,
  };
}

describe('buildFleetSeries', () => {
  it('splits one payload into a series per resource', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 2,
            cpu_avg: 40,
            cpu_max: 98,
            memory_avg: 45,
            memory_max: 52,
            disk_avg: 14,
            disk_max: 20,
          },
        ],
      }),
    );

    expect(Object.keys(series.resources).sort()).toEqual(
      [...FLEET_RESOURCES].sort(),
    );
    expect(series.resources.cpu.currentAvg).toBe(40);
    expect(series.resources.disk.currentAvg).toBe(14);
    expect(series.machines).toBe(2);
    expect(series.hasData).toBe(true);
  });

  it('plots a bucket nobody reported in as a gap, not as zero', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          { timestamp: '2026-10-21T19:00:00Z', machines: 0 },
          {
            timestamp: '2026-10-21T20:00:00Z',
            machines: 1,
            cpu_avg: 30,
            cpu_max: 30,
          },
        ],
      }),
    );

    // A silent agent must break the line rather than draw a drop to 0%.
    expect(series.resources.cpu.points[0]?.avg).toBeNull();
    expect(series.resources.cpu.points[1]?.avg).toBe(30);
  });

  it('reports the current reading from the latest bucket that had one', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 1,
            cpu_avg: 30,
            cpu_max: 30,
          },
          { timestamp: '2026-10-21T20:00:00Z', machines: 0 },
        ],
      }),
    );

    expect(series.resources.cpu.currentAvg).toBe(30);
  });

  it('draws, names and quotes one and the same busiest server', () => {
    // web-01 has the single highest sample (cpu_max 100) in every bucket, but
    // web-02 has the highest average, so web-02 is the busiest server. The
    // line, the name and the peak must all be web-02's, never web-01's 100%.
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 2,
            cpu_avg: 16,
            cpu_max: 100,
            cpu_busiest: 30,
          },
          {
            timestamp: '2026-10-21T20:00:00Z',
            machines: 2,
            cpu_avg: 12,
            cpu_max: 100,
            cpu_busiest: 20,
          },
        ],
        busiest: {
          cpu: {
            machine_id: '2',
            machine_hostname: 'web-02',
            average: 25,
            peak: 30,
          },
        },
        peak: {
          cpu: { machine_id: '1', machine_hostname: 'web-01', percent: 100 },
        },
      }),
    );

    const cpu = series.resources.cpu;
    expect(cpu.busiest?.machineId).toBe('2');
    expect(cpu.busiest?.hostname).toBe('web-02');
    expect(cpu.busiest?.average).toBe(25);
    expect(cpu.points.map((point) => point.busiest)).toEqual([30, 20]);
    // The quoted peak is the top of the drawn line, not the raw sample max.
    expect(cpu.busiest?.peak).toBe(
      Math.max(...cpu.points.map((point) => point.busiest ?? 0)),
    );
    expect(cpu.busiest?.peak).toBe(30);
    expect(series.resources.memory.busiest).toBeUndefined();
  });

  it('breaks the busiest line where that server did not report', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 2,
            cpu_avg: 20,
            cpu_busiest: 35,
          },
          // Only another server reported here.
          {
            timestamp: '2026-10-21T20:00:00Z',
            machines: 1,
            cpu_avg: 5,
            cpu_busiest: null,
          },
        ],
        busiest: { cpu: { machine_id: '2', average: 35, peak: 35 } },
      }),
    );

    expect(series.resources.cpu.points.map((point) => point.busiest)).toEqual([
      35,
      null,
    ]);
    expect(series.resources.cpu.busiest?.hostname).toBeUndefined();
  });

  it('orders points oldest first and drops unparseable timestamps', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T20:00:00Z',
            machines: 1,
            cpu_avg: 2,
            cpu_max: 2,
          },
          { timestamp: 'not-a-time', machines: 1, cpu_avg: 9, cpu_max: 9 },
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 1,
            cpu_avg: 1,
            cpu_max: 1,
          },
        ],
      }),
    );

    const points = series.resources.cpu.points;
    expect(points).toHaveLength(2);
    expect(points[0]?.avg).toBe(1);
    expect(points[1]?.avg).toBe(2);
  });

  it('clamps readings outside 0-100', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 1,
            cpu_avg: 140,
            cpu_busiest: -4,
          },
        ],
        busiest: { cpu: { machine_id: '2', average: 0, peak: 0 } },
      }),
    );

    expect(series.resources.cpu.points[0]?.avg).toBe(100);
    expect(series.resources.cpu.points[0]?.busiest).toBe(0);
  });

  it('marks an all-quiet window empty without losing its buckets', () => {
    const series = buildFleetSeries(
      payload({
        has_data: false,
        machines: 0,
        points: [
          { timestamp: '2026-10-21T19:00:00Z', machines: 0 },
          { timestamp: '2026-10-21T20:00:00Z', machines: 0 },
        ],
      }),
    );

    expect(series.hasData).toBe(false);
    expect(series.resources.cpu.isEmpty).toBe(true);
    // Buckets survive so the chart can still draw an axis.
    expect(series.resources.cpu.points).toHaveLength(2);
  });

  it('survives a missing or empty payload', () => {
    for (const series of [buildFleetSeries(undefined), buildFleetSeries({})]) {
      expect(series.hasData).toBe(false);
      expect(series.machines).toBe(0);
      expect(series.resources.cpu.points).toEqual([]);
      expect(series.resources.cpu.isEmpty).toBe(true);
    }
  });
});

describe('fleetSeverity', () => {
  it.each([
    [10, 'healthy'],
    [84.9, 'healthy'],
    [85, 'warning'],
    [94.9, 'warning'],
    [95, 'critical'],
    [100, 'critical'],
  ])('maps %s to %s', (percent, expected) => {
    expect(fleetSeverity(percent)).toBe(expected);
  });

  it('treats an absent reading as healthy rather than critical', () => {
    expect(fleetSeverity(undefined)).toBe('healthy');
    expect(fleetSeverity(null)).toBe('healthy');
  });
});
