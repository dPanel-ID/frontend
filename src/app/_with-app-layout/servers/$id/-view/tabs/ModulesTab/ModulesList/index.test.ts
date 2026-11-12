import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { failureReason, groupStatus, preferredInstallation } from './index';

function installation(
  overrides: Partial<DTOs.ModuleInstallationV1> = {},
): DTOs.ModuleInstallationV1 {
  return {
    id: 'mi_1',
    scope_type: 'machine',
    scope_id: '1',
    module_name: 'redis',
    name: 'redis',
    status: 'installed',
    ...overrides,
  };
}

describe('preferredInstallation', () => {
  it('opens the failed installation first', () => {
    const failed = installation({ id: 'mi_2', status: 'failed' });
    expect(
      preferredInstallation([
        installation(),
        failed,
        installation({ id: 'mi_3' }),
      ]),
    ).toBe(failed);
  });

  it('opens the newest installation when none failed', () => {
    const newest = installation({ id: 'mi_3' });
    expect(preferredInstallation([installation(), newest])).toBe(newest);
  });
});

describe('failureReason', () => {
  it('names the task and its message', () => {
    expect(
      failureReason(
        installation({
          status: 'failed',
          last_error: 'playbook failed',
          last_error_detail: {
            task: 'Install Redis 8.10',
            message: 'Redis 7.4 is not published for Ubuntu 26.04',
          },
        }),
      ),
    ).toEqual({
      task: 'Install Redis 8.10',
      message: 'Redis 7.4 is not published for Ubuntu 26.04',
    });
  });

  it('falls back to the last error', () => {
    expect(
      failureReason(installation({ status: 'failed', last_error: 'boom' })),
    ).toEqual({ task: undefined, message: 'boom' });
  });
});

describe('groupStatus', () => {
  it('is failed when any installation failed', () => {
    expect(
      groupStatus([installation(), installation({ status: 'failed' })]),
    ).toBe('failed');
  });
});
