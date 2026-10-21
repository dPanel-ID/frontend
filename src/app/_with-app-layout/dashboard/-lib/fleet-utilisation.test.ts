import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  FLEET_RESOURCES,
  buildFleetSeries,
  fleetSeverity,
  shouldNamePeak,
} from './fleet-utilisation';
import type { FleetResourceSeries } from './fleet-utilisation';

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
    expect(series.resources.cpu.currentMax).toBe(98);
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

  it('carries the peak and the machine that produced it', () => {
    const series = buildFleetSeries(
      payload({
        points: [
          {
            timestamp: '2026-10-21T19:00:00Z',
            machines: 2,
            cpu_avg: 40,
            cpu_max: 98,
          },
        ],
        peak: {
          cpu: { machine_id: '7', machine_hostname: 'web-01', percent: 98 },
        },
      }),
    );

    expect(series.resources.cpu.peak).toBe(98);
    expect(series.resources.cpu.peakMachineHostname).toBe('web-01');
    expect(series.resources.memory.peak).toBeUndefined();
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
            cpu_max: -4,
          },
        ],
      }),
    );

    expect(series.resources.cpu.points[0]?.avg).toBe(100);
    expect(series.resources.cpu.points[0]?.max).toBe(0);
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

describe('shouldNamePeak', () => {
  const series = (
    overrides: Partial<FleetResourceSeries> = {},
  ): FleetResourceSeries => ({
    resource: 'cpu',
    points: [],
    isEmpty: false,
    ...overrides,
  });

  it('names a peak that is high and well above the average', () => {
    expect(
      shouldNamePeak(series({ peak: 98, peakMachineId: '7', currentAvg: 40 })),
    ).toBe(true);
  });

  it('stays quiet when the peak is below the warning line', () => {
    expect(
      shouldNamePeak(series({ peak: 60, peakMachineId: '7', currentAvg: 10 })),
    ).toBe(false);
  });

  it('stays quiet when the peak is just the fleet reading twice', () => {
    // One machine at 90% with a fleet average of 89% is not a hot server.
    expect(
      shouldNamePeak(series({ peak: 90, peakMachineId: '7', currentAvg: 89 })),
    ).toBe(false);
  });

  it('needs a machine to name', () => {
    expect(shouldNamePeak(series({ peak: 98, currentAvg: 10 }))).toBe(false);
    expect(shouldNamePeak(series({ peakMachineId: '7' }))).toBe(false);
  });
});
