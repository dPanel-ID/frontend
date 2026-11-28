import { describe, expect, it } from 'vitest';

import { durationSeconds, lifecycleErrors } from './form-schema';
import type { SchemaLifecycleEdit } from './form-schema';

const valid: SchemaLifecycleEdit = {
  release: {
    enabled: true,
    commands: ['php artisan migrate --force'],
    timeout: '15m',
  },
  postDeploy: null,
  processes: [
    {
      name: 'worker',
      type: 'service',
      command: 'php artisan queue:work',
      instances: 2,
    },
  ],
  healthCheck: { path: '/up', expectedStatus: 200, timeout: '5s', retries: 10 },
  hasPort: true,
};

describe('lifecycleErrors', () => {
  it('accepts a valid lifecycle', () => {
    expect(lifecycleErrors(valid)).toEqual({});
  });

  const cases: Array<[string, Partial<SchemaLifecycleEdit>, string]> = [
    [
      'processes.0.name',
      { processes: [{ ...valid.processes[0]!, name: 'Worker 1' }] },
      'badProcessName',
    ],
    [
      'processes.0.name',
      { processes: [{ ...valid.processes[0]!, name: 'web' }] },
      'reservedProcessName',
    ],
    [
      'processes.0.instances',
      { processes: [{ ...valid.processes[0]!, instances: 9 }] },
      'badInstances',
    ],
    [
      'processes',
      { processes: [valid.processes[0]!, valid.processes[0]!] },
      'duplicateProcessName',
    ],
    [
      'release.timeout',
      { release: { ...valid.release!, timeout: '5s' } },
      'badCommandTimeout',
    ],
    [
      'healthCheck.path',
      { healthCheck: { ...valid.healthCheck!, path: 'up' } },
      'badHealthPath',
    ],
    [
      'healthCheck.retries',
      { healthCheck: { ...valid.healthCheck!, retries: 61 } },
      'badRetries',
    ],
    [
      'healthCheck.timeout',
      { healthCheck: { ...valid.healthCheck!, timeout: '2m' } },
      'badHealthTimeout',
    ],
  ];

  it.each(cases)('%s: %s', (path, patch, message) => {
    expect(lifecycleErrors({ ...valid, ...patch })[path]).toBe(message);
  });

  it('needs a port for a health check', () => {
    expect(
      lifecycleErrors({ ...valid, hasPort: false })['healthCheck.path'],
    ).toBe('healthNeedsPort');
    expect(
      lifecycleErrors({ ...valid, hasPort: false, healthCheck: null }),
    ).toEqual({});
  });
});

describe('durationSeconds', () => {
  it('reads Go-style durations', () => {
    expect(durationSeconds('1h30m')).toBe(5400);
    expect(durationSeconds('45s')).toBe(45);
    expect(durationSeconds('')).toBeNull();
    expect(durationSeconds('10x')).toBeNull();
  });
});
