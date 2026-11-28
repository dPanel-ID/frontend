// @vitest-environment jsdom
import { useState } from 'react';

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RedisHelper from '.';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  useDevetekLocale: () => 'en',
}));

let inventory: unknown[] = [];
let lastRefreshIntervalMs: number | undefined;
vi.mock('@/shared/api', () => ({
  ApiServer: {
    Modules: {
      $Id: {
        useGet: (params: {
          options?: { skip?: boolean; refreshIntervalMs?: number };
        }) => {
          lastRefreshIntervalMs = params.options?.refreshIntervalMs;
          return [
            params.options?.skip
              ? { $status: 'initial' }
              : { $status: 'success', modules: inventory },
            vi.fn(),
          ];
        },
      },
    },
  },
}));

let envText = '';

function Harness(props: { initial: string; laravel: boolean }) {
  const [text, setText] = useState(props.initial);
  return (
    <RedisHelper
      serverId="42"
      appName="My Blog"
      envText={text}
      onEnvTextChange={(next) => {
        envText = next;
        setText(next);
      }}
      laravel={props.laravel}
    />
  );
}

function renderHelper(runtimeEnvText = '', laravel = true) {
  return render(<Harness initial={runtimeEnvText} laravel={laravel} />);
}

afterEach(() => {
  cleanup();
  envText = '';
});

describe('RedisHelper', () => {
  // Redis picked in the previous step was still installing, and the helper
  // never noticed it had finished (2026-11-28).
  it('reads the modules again while Redis is installing', () => {
    inventory = [{ module_name: 'redis', status: 'installing', variables: {} }];
    renderHelper();
    expect(screen.getByText('noRedis')).toBeTruthy();
    expect(lastRefreshIntervalMs).toBe(5_000);
  });

  it('stops reading once the modules have settled', () => {
    inventory = [{ module_name: 'redis', status: 'installed', variables: {} }];
    renderHelper();
    expect(lastRefreshIntervalMs).toBe(0);
  });

  it('points to the Modules tab when the server has no Redis', () => {
    inventory = [{ module_name: 'mariadb', status: 'installed' }];
    renderHelper();
    expect(screen.getByText('noRedis')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'open' })).toBeNull();
  });

  it('fills the variables and switches the drivers, with no password asked', () => {
    inventory = [
      {
        module_name: 'redis',
        status: 'installed',
        variables: { redis_bind_interface: '127.0.0.1', redis_port: 6379 },
      },
    ];
    renderHelper('CACHE_STORE=database\nAPP_ENV=production');
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.queryByLabelText('password')).toBeNull();
    // Sessions stay where they are.
    fireEvent.click(screen.getByLabelText('drivers.session'));
    fireEvent.click(screen.getByRole('button', { name: 'apply' }));

    expect(envText.split('\n')).toEqual([
      'CACHE_STORE=redis',
      'APP_ENV=production',
      'REDIS_HOST=127.0.0.1',
      'REDIS_PORT=6379',
      'REDIS_PREFIX=my_blog_',
      'QUEUE_CONNECTION=redis',
    ]);
    expect(screen.getByRole('status').textContent).toContain('applied');
  });

  it('asks for the password Redis requires and never shows it afterwards', () => {
    inventory = [
      {
        module_name: 'redis',
        status: 'installed',
        variables: {
          redis_bind_interface: '10.0.0.5',
          redis_requirepass: '[redacted]',
        },
      },
    ];
    renderHelper();
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply' }));
    expect(screen.getByText('passwordRequired')).toBeTruthy();
    expect(envText).toBe('');

    fireEvent.change(screen.getByLabelText('password'), {
      target: { value: 'typed-secret-value' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'apply' }));
    expect(envText).toContain('REDIS_HOST=10.0.0.5');
    expect(envText).toContain('REDIS_PASSWORD=typed-secret-value');
    expect(document.body.textContent).not.toContain('typed-secret-value');
  });

  // An application that is not Laravel gets the connection only: no key
  // prefix and no Laravel driver variables.
  it('writes only the connection for an application that is not Laravel', () => {
    inventory = [
      {
        module_name: 'redis',
        status: 'installed',
        variables: { redis_bind_interface: '127.0.0.1', redis_port: 6379 },
      },
    ];
    renderHelper('PORT=3000', false);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.queryByLabelText('prefix')).toBeNull();
    expect(screen.queryByText('driversTitle')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'apply' }));

    expect(envText.split('\n')).toEqual([
      'PORT=3000',
      'REDIS_HOST=127.0.0.1',
      'REDIS_PORT=6379',
      'REDIS_URL=redis://127.0.0.1:6379',
    ]);
  });
});
