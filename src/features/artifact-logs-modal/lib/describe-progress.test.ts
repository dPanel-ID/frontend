import { describe, expect, it } from 'vitest';

import type { BuildStageV1 } from '@/shared/api/-dtos/application';

import {
  buildStepNumber,
  elapsedMs,
  focusStage,
  formatBuildDuration,
  isBuildActive,
  ranSteps,
  runElapsedMs,
} from './describe-progress';

const stage = (extra: Partial<BuildStageV1>): BuildStageV1 => ({
  key: 'setup',
  kind: 'setup',
  status: 'succeeded',
  started_at: '2026-11-08T07:00:00Z',
  finished_at: '2026-11-08T07:00:10Z',
  steps: [],
  ...extra,
});

describe('build progress', () => {
  it.each([
    [0, '0s'],
    [45_000, '45s'],
    [80_000, '1m 20s'],
    [3_900_000, '1h 5m'],
    [-5, '0s'],
  ])('formats %d ms as %s', (ms, text) => {
    expect(formatBuildDuration(ms)).toBe(text);
  });

  it('keeps polling only while the build can change', () => {
    expect(isBuildActive({ status: 'running', stages: [] })).toBe(true);
    expect(isBuildActive({ status: 'waiting', stages: [] })).toBe(true);
    expect(isBuildActive({ status: 'succeeded', stages: [] })).toBe(false);
    expect(isBuildActive({ status: 'none', stages: [] })).toBe(false);
    expect(isBuildActive(undefined)).toBe(false);
  });

  it('counts what is unfinished up to now', () => {
    const start = Date.parse('2026-11-08T07:00:00Z');
    const running = { started_at: '2026-11-08T07:00:00Z' };
    expect(elapsedMs(running, start + 7_000)).toBe(7_000);
    expect(
      elapsedMs(
        { ...running, finished_at: '2026-11-08T07:00:03Z' },
        start + 7_000,
      ),
    ).toBe(3_000);
  });

  it('measures the run from the first stage to the last', () => {
    const stages = [
      stage({}),
      stage({
        started_at: '2026-11-08T07:00:10Z',
        finished_at: '2026-11-08T07:01:00Z',
      }),
    ];
    expect(runElapsedMs(stages, 0)).toBe(60_000);
    expect(runElapsedMs([], 0)).toBe(0);
  });

  it('reads the number of a build step', () => {
    expect(buildStepNumber({ key: 'build_step_3' })).toBe(3);
  });

  it('points at the failed stage before the running one', () => {
    const failed = stage({ key: 'a', status: 'failed' });
    const running = stage({ key: 'b', status: 'running' });
    expect(focusStage({ status: 'failed', stages: [running, failed] })).toBe(
      failed,
    );
    expect(focusStage({ status: 'running', stages: [running] })).toBe(running);
    expect(focusStage({ status: 'succeeded', stages: [stage({})] })).toBe(
      undefined,
    );
  });

  it('leaves out the steps Ansible skipped', () => {
    const ran = {
      name: 'a',
      status: 'succeeded',
      started_at: 'x',
    } as const;
    expect(
      ranSteps(
        stage({ steps: [ran, { ...ran, name: 'b', status: 'skipped' }] }),
      ),
    ).toEqual([ran]);
  });
});
