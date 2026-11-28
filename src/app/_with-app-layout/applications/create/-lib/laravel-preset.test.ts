import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  EMPTY_LIFECYCLE,
  IDLE_PREFLIGHT,
  addMissingEnv,
  isPreflightBlocking,
  lifecycleDefinition,
  pickVersionOption,
  presetFormPatch,
  presetModuleVariables,
  sortPreflightChecks,
} from './laravel-preset';

function laravelPreset(
  overrides: {
    octane?: boolean;
    node?: 'npm' | 'pnpm' | 'yarn' | null;
    health?: boolean;
  } = {},
): DTOs.ApplicationPresetV1 {
  const { octane = true, node = 'npm', health = true } = overrides;
  const nodeBuild: Record<'npm' | 'pnpm' | 'yarn', string> = {
    npm: 'npm ci && npm run build',
    pnpm: 'corepack pnpm install --frozen-lockfile && corepack pnpm run build',
    yarn: 'corepack yarn install --frozen-lockfile && corepack yarn build',
  };
  return {
    framework: 'laravel',
    detected: true,
    facts: {
      laravel_version: '13.44.1',
      php_constraint: '^8.4',
      octane,
      node: node !== null,
      package_manager: node ?? '',
      health_route: health,
      composer_lock: true,
    },
    definition: {
      setup: {
        framework: 'laravel',
        language: { name: 'php', version: '8.4' },
        languages: node ? [{ name: 'nodejs', version: '22' }] : [],
      },
      build: {
        target: {
          machine: {
            steps: [
              {
                name: 'Install PHP dependencies',
                command: [
                  'composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist',
                ],
              },
              ...(node
                ? [
                    {
                      name: 'Build front-end assets',
                      command: [nodeBuild[node]],
                    },
                  ]
                : []),
            ],
          },
        },
      },
      run: {
        command: octane
          ? 'php artisan octane:frankenphp --host=127.0.0.1 --port=$PORT --max-requests=500'
          : 'frankenphp php-server --listen 127.0.0.1:$PORT --root public/',
        environment: [
          { key: 'APP_ENV', value: 'production' },
          { key: 'APP_DEBUG', value: 'false' },
          { key: 'LOG_CHANNEL', value: 'stderr' },
          ...(octane
            ? [
                { key: 'OCTANE_SERVER', value: 'frankenphp' },
                { key: 'OCTANE_DISABLE_CADDY_ADMIN', value: 'true' },
              ]
            : []),
        ],
      },
      release: {
        enabled: true,
        commands: [
          'php artisan storage:link --force',
          'php artisan migrate --force',
          'php artisan optimize',
        ],
      },
      post_deploy: { commands: ['php artisan reload'] },
      ...(health
        ? {
            health_check: {
              path: '/up',
              expected_status: 200,
              timeout: '5s',
              retries: 10,
            },
          }
        : {}),
    },
    processes: [
      {
        name: 'worker',
        type: 'service',
        command: 'php artisan queue:work --tries=3 --max-time=3600 --sleep=3',
        instances: 1,
      },
      {
        name: 'scheduler',
        type: 'schedule',
        command: 'php artisan schedule:run',
      },
    ],
    modules: [
      { name: 'php', version: '8.4', role: 'language' },
      { name: 'nodejs', version: '22', role: 'language' },
      { name: 'frankenphp', role: 'dependency' },
    ],
    hints: [{ code: 'app_key_managed' }, { code: 'app_url_missing' }],
    checks: [],
  };
}

describe('presetFormPatch', () => {
  it('is null for a repository without a preset', () => {
    expect(
      presetFormPatch(
        { framework: '', detected: false },
        { runtimeEnvText: '', key: 'k' },
      ),
    ).toBeNull();
    expect(presetFormPatch(null, { runtimeEnvText: '', key: 'k' })).toBeNull();
  });

  it('fills Laravel with Octane, Node.js and a health check', () => {
    const patch = presetFormPatch(laravelPreset(), {
      runtimeEnvText: '',
      key: 'repo@main',
    });
    expect(patch).not.toBeNull();
    expect(patch?.appFramework).toBe('laravel');
    expect(patch?.appProgLang).toBe('php');
    expect(patch?.appProgLangVersion).toBe('8.4');
    expect(patch?.appBuildCommand).toEqual([
      'composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist',
      'npm ci && npm run build',
    ]);
    expect(patch?.appRunCommand).toContain('octane:frankenphp');
    expect(patch?.runtimeEnvText).toContain('OCTANE_DISABLE_CADDY_ADMIN=true');
    expect(patch?.runtimeEnvText).not.toContain('APP_KEY');
    expect(patch?.lifecycle.release?.commands).toHaveLength(3);
    expect(patch?.lifecycle.healthCheck?.path).toBe('/up');
    expect(patch?.lifecycle.postDeployCommands).toEqual(['php artisan reload']);
    // Offered, never on by default.
    expect(patch?.lifecycle.offeredProcesses.map((p) => p.name)).toEqual([
      'worker',
      'scheduler',
    ]);
    expect(patch?.lifecycle.enabledProcessNames).toEqual([]);
    expect(patch?.laravelPreset.key).toBe('repo@main');
    expect(patch?.laravelPreset.hints).toEqual([
      'app_key_managed',
      'app_url_missing',
    ]);
  });

  it('fills Laravel without Octane, Node.js or a health route', () => {
    const patch = presetFormPatch(
      laravelPreset({ octane: false, node: null, health: false }),
      { runtimeEnvText: '', key: 'k' },
    );
    expect(patch?.appRunCommand).toBe(
      'frankenphp php-server --listen 127.0.0.1:$PORT --root public/',
    );
    expect(patch?.appBuildCommand).toHaveLength(1);
    expect(patch?.runtimeEnvText).not.toContain('OCTANE');
    expect(patch?.lifecycle.healthCheck).toBeNull();
  });

  it.each(['pnpm', 'yarn'] as const)(
    'keeps the %s build command of the preset',
    (manager) => {
      const patch = presetFormPatch(laravelPreset({ node: manager }), {
        runtimeEnvText: '',
        key: 'k',
      });
      expect(patch?.appBuildCommand[1]).toContain(`corepack ${manager}`);
    },
  );

  it('never overwrites a variable the user typed', () => {
    const patch = presetFormPatch(laravelPreset(), {
      runtimeEnvText: 'APP_ENV=staging\nDB_PASSWORD=typed',
      key: 'k',
    });
    expect(patch?.runtimeEnvText).toContain('APP_ENV=staging');
    expect(patch?.runtimeEnvText).not.toContain('APP_ENV=production');
    expect(patch?.runtimeEnvText).toContain('DB_PASSWORD=typed');
    expect(patch?.runtimeEnvText).toContain('LOG_CHANNEL=stderr');
  });

  it('tolerates null entries from production-shaped data', () => {
    const preset = laravelPreset();
    (preset as unknown as { processes: unknown[] }).processes = [
      null,
      { name: 'worker', command: 'php artisan queue:work' },
    ];
    (preset as unknown as { hints: unknown }).hints = null;
    const patch = presetFormPatch(preset, { runtimeEnvText: '', key: 'k' });
    expect(patch?.lifecycle.offeredProcesses).toHaveLength(1);
    expect(patch?.laravelPreset.hints).toEqual([]);
  });
});

describe('addMissingEnv', () => {
  it('adds only keys the text does not set', () => {
    expect(
      addMissingEnv('A=1', [
        ['A', '2'],
        ['B', '3'],
      ]),
    ).toBe('A=1\nB=3');
  });
});

describe('lifecycleDefinition', () => {
  it('leaves every section out when nothing is set', () => {
    expect(lifecycleDefinition(EMPTY_LIFECYCLE)).toEqual({});
  });

  it('sends the release, post-deploy, enabled processes and health check', () => {
    const patch = presetFormPatch(laravelPreset(), {
      runtimeEnvText: '',
      key: 'k',
    });
    const lifecycle = {
      ...patch!.lifecycle,
      enabledProcessNames: ['scheduler'],
    };
    const definition = lifecycleDefinition(lifecycle);
    expect(definition.release?.commands).toHaveLength(3);
    expect(definition.release?.enabled).toBe(true);
    expect(definition.post_deploy?.commands).toEqual(['php artisan reload']);
    expect(definition.processes?.map((p) => p.name)).toEqual(['scheduler']);
    expect(definition.health_check).toEqual({
      path: '/up',
      expected_status: 200,
      timeout: '5s',
      retries: 10,
    });
  });

  it('drops a cleared health check and blank commands', () => {
    const definition = lifecycleDefinition({
      ...EMPTY_LIFECYCLE,
      release: {
        enabled: false,
        commands: ['  ', 'php artisan migrate --force'],
        timeout: '',
      },
      healthCheck: {
        path: ' ',
        expectedStatus: 200,
        timeout: '5s',
        retries: 10,
      },
    });
    expect(definition.release).toEqual({
      enabled: false,
      commands: ['php artisan migrate --force'],
    });
    expect(definition.health_check).toBeUndefined();
  });
});

describe('pickVersionOption', () => {
  it('picks the newest option of a major', () => {
    expect(pickVersionOption('22', ['26.13.1', '22.1.0', '22.23.5'])).toBe(
      '22.23.5',
    );
    expect(pickVersionOption('8.4', ['8.5', '8.4', '8.3'])).toBe('8.4');
    expect(pickVersionOption('20', ['22.23.5'])).toBe('');
  });
});

describe('presetModuleVariables', () => {
  const inputs: DTOs.ModuleInputV1[] = [
    {
      name: 'nodejs_version',
      label: 'Node.js',
      type: 'string',
      required: true,
      default: '26.13.1',
      options: ['26.13.1', '24.22.3', '22.23.5'],
    },
    {
      name: 'runtime_set_default',
      label: 'Default',
      type: 'boolean',
      required: false,
      default: false,
    },
    {
      name: 'runtime_module',
      label: 'Runtime',
      type: 'hidden',
      required: true,
      default: 'nodejs',
    },
  ];

  it('sets the version input to the option of the wanted major', () => {
    expect(
      presetModuleVariables({ name: 'nodejs', version: '22' }, inputs),
    ).toEqual({
      nodejs_version: '22.23.5',
      runtime_set_default: false,
      runtime_module: 'nodejs',
    });
  });

  it('refuses a version the catalog does not offer', () => {
    expect(
      presetModuleVariables({ name: 'nodejs', version: '18' }, inputs),
    ).toBeNull();
  });

  it('keeps the defaults of a module without a version', () => {
    expect(presetModuleVariables({ name: 'frankenphp' }, inputs)).toMatchObject(
      {
        nodejs_version: '26.13.1',
      },
    );
  });
});

describe('pre-flight gating', () => {
  const blocking = {
    ...IDLE_PREFLIGHT,
    status: 'done' as const,
    blocking: true,
  };

  it('holds the deploy on a blocking result until overridden', () => {
    expect(isPreflightBlocking(blocking, false)).toBe(true);
    expect(isPreflightBlocking(blocking, true)).toBe(false);
  });

  it('never holds on a check that could not run', () => {
    expect(isPreflightBlocking({ ...blocking, status: 'failed' }, false)).toBe(
      false,
    );
    expect(isPreflightBlocking({ ...blocking, blocking: false }, false)).toBe(
      false,
    );
  });

  it('lists errors before warnings', () => {
    expect(
      sortPreflightChecks([
        { code: 'composer_lock_missing', level: 'warning' },
        { code: 'php_version_unsupported', level: 'error' },
      ]).map((check) => check.code),
    ).toEqual(['php_version_unsupported', 'composer_lock_missing']);
  });
});
