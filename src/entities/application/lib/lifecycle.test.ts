import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { isLifecycleEmpty, lifecyclePatch, toLifecycleView } from './lifecycle';

describe('toLifecycleView', () => {
  it('reads a definition saved before the sections existed', () => {
    const view = toLifecycleView({ run: { command: './start.sh' } });
    expect(view).toEqual({
      release: null,
      postDeploy: null,
      processes: [],
      healthCheck: null,
    });
    expect(isLifecycleEmpty(view)).toBe(true);
    expect(isLifecycleEmpty(toLifecycleView(null))).toBe(true);
  });

  it('reads null and partial sections without crashing', () => {
    const view = toLifecycleView({
      release: { commands: null } as unknown as DTOs.AppDefinitionRelease,
      post_deploy: null,
      processes: [
        null,
        { name: '', command: 'x' },
        { name: 'worker', command: 'php artisan queue:work' },
        {
          name: 'scheduler',
          type: 'schedule',
          command: 'php artisan schedule:run',
          instances: 4,
        },
      ] as unknown as DTOs.AppDefinitionProcess[],
      health_check: { path: '' },
    });
    expect(view.release).toEqual({ enabled: true, commands: [], timeout: '' });
    expect(view.postDeploy).toBeNull();
    expect(view.processes).toEqual([
      {
        name: 'worker',
        type: 'service',
        command: 'php artisan queue:work',
        instances: 1,
      },
      {
        name: 'scheduler',
        type: 'schedule',
        command: 'php artisan schedule:run',
        instances: 1,
      },
    ]);
    expect(view.healthCheck).toBeNull();
  });

  it('reads a disabled release and a health check with defaults', () => {
    const view = toLifecycleView({
      release: { enabled: false, commands: ['php artisan migrate --force'] },
      health_check: { path: '/up' },
    });
    expect(view.release?.enabled).toBe(false);
    expect(view.healthCheck).toEqual({
      path: '/up',
      expectedStatus: 200,
      timeout: '',
      retries: 10,
    });
    expect(isLifecycleEmpty(view)).toBe(false);
  });
});

describe('lifecyclePatch', () => {
  it('removes emptied sections with null and processes with []', () => {
    expect(
      lifecyclePatch({
        release: { enabled: true, commands: ['  '], timeout: '' },
        postDeploy: null,
        processes: [],
        healthCheck: null,
      }),
    ).toEqual({
      release: null,
      post_deploy: null,
      processes: [],
      health_check: null,
    });
  });

  it('writes the sections it keeps', () => {
    expect(
      lifecyclePatch({
        release: {
          enabled: false,
          commands: ['php artisan migrate --force'],
          timeout: '20m',
        },
        postDeploy: { commands: ['php artisan reload'], timeout: '' },
        processes: [
          {
            name: 'worker',
            type: 'service',
            command: 'php artisan queue:work',
            instances: 2,
          },
          {
            name: 'scheduler',
            type: 'schedule',
            command: 'php artisan schedule:run',
            instances: 1,
          },
        ],
        healthCheck: {
          path: '/up',
          expectedStatus: 200,
          timeout: '5s',
          retries: 10,
        },
      }),
    ).toEqual({
      release: {
        enabled: false,
        commands: ['php artisan migrate --force'],
        timeout: '20m',
      },
      post_deploy: { commands: ['php artisan reload'] },
      processes: [
        {
          name: 'worker',
          type: 'service',
          command: 'php artisan queue:work',
          instances: 2,
        },
        {
          name: 'scheduler',
          type: 'schedule',
          command: 'php artisan schedule:run',
        },
      ],
      health_check: {
        path: '/up',
        expected_status: 200,
        timeout: '5s',
        retries: 10,
      },
    });
  });
});
