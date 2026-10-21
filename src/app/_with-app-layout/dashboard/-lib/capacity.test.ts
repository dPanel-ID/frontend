import { describe, expect, it } from 'vitest';

import { CAPACITY_PRESSURE_PERCENT, buildCapacityReport } from './capacity';
import type { CapacityMetric, ServerUsageSample } from './capacity';

function sample(
  serverId: string,
  values: Partial<Record<CapacityMetric, number | undefined>> = {},
): ServerUsageSample {
  return {
    serverId,
    serverName: `host-${serverId}`,
    ...values,
  };
}

function reportFor(
  reports: ReturnType<typeof buildCapacityReport>,
  metric: CapacityMetric,
) {
  const report = reports.find((item) => item.metric === metric);
  if (!report) throw new Error(`missing report for ${metric}`);
  return report;
}

describe('buildCapacityReport', () => {
  it('reports memory, cpu and disk in reading order', () => {
    expect(buildCapacityReport([]).map((report) => report.metric)).toEqual([
      'memory',
      'cpu',
      'disk',
    ]);
  });

  it('reports nothing when no server has been sampled', () => {
    for (const report of buildCapacityReport([])) {
      expect(report.reporting).toBe(0);
      expect(report.pressured).toHaveLength(0);
      expect(report.highest).toBeUndefined();
    }
  });

  it('surfaces the one hot server an average would hide', () => {
    const samples = [
      sample('hot', { memory: 98 }),
      ...Array.from({ length: 11 }, (_, index) =>
        sample(`idle-${index}`, { memory: 5 }),
      ),
    ];

    const memory = reportFor(buildCapacityReport(samples), 'memory');

    expect(memory.reporting).toBe(12);
    expect(memory.pressured).toHaveLength(1);
    expect(memory.pressured[0]).toMatchObject({
      serverId: 'hot',
      value: 98,
    });
    expect(memory.highest?.serverId).toBe('hot');
  });

  it('names every pressured server, worst first', () => {
    const samples = [
      sample('a', { cpu: 88 }),
      sample('b', { cpu: 99 }),
      sample('c', { cpu: 12 }),
      sample('d', { cpu: 91 }),
    ];

    const cpu = reportFor(buildCapacityReport(samples), 'cpu');

    expect(cpu.pressured.map((reading) => reading.serverId)).toEqual([
      'b',
      'd',
      'a',
    ]);
  });

  it('orders equal readings by name so the list does not shuffle', () => {
    const samples = [
      sample('z', { disk: 90 }),
      sample('a', { disk: 90 }),
      sample('m', { disk: 90 }),
    ];

    const disk = reportFor(buildCapacityReport(samples), 'disk');

    expect(disk.pressured.map((reading) => reading.serverName)).toEqual([
      'host-a',
      'host-m',
      'host-z',
    ]);
  });

  it('counts a server exactly at the threshold as under pressure', () => {
    const samples = [
      sample('at', { memory: CAPACITY_PRESSURE_PERCENT }),
      sample('below', { memory: CAPACITY_PRESSURE_PERCENT - 0.5 }),
    ];

    const memory = reportFor(buildCapacityReport(samples), 'memory');

    expect(memory.pressured.map((reading) => reading.serverId)).toEqual(['at']);
  });

  it('honours a caller supplied threshold', () => {
    const samples = [sample('warm', { memory: 70 })];

    expect(
      reportFor(buildCapacityReport(samples, 60), 'memory').pressured,
    ).toHaveLength(1);
    expect(
      reportFor(buildCapacityReport(samples, 80), 'memory').pressured,
    ).toHaveLength(0);
  });

  it('drops dimensions a server did not report instead of counting them as zero', () => {
    const samples = [sample('partial', { memory: 90 }), sample('quiet', {})];

    const reports = buildCapacityReport(samples);

    expect(reportFor(reports, 'memory').reporting).toBe(1);
    expect(reportFor(reports, 'cpu').reporting).toBe(0);
    expect(reportFor(reports, 'cpu').highest).toBeUndefined();
  });

  it('ignores readings that are not finite numbers', () => {
    const samples = [
      sample('broken', { cpu: Number.NaN }),
      sample('also-broken', { cpu: Number.POSITIVE_INFINITY }),
      sample('fine', { cpu: 40 }),
    ];

    const cpu = reportFor(buildCapacityReport(samples), 'cpu');

    expect(cpu.reporting).toBe(1);
    expect(cpu.highest?.serverId).toBe('fine');
  });

  it('still reports the highest reading when nothing is under pressure', () => {
    const samples = [sample('a', { disk: 20 }), sample('b', { disk: 62 })];

    const disk = reportFor(buildCapacityReport(samples), 'disk');

    expect(disk.pressured).toHaveLength(0);
    expect(disk.highest).toMatchObject({ serverId: 'b', value: 62 });
  });
});
