// @vitest-environment jsdom
import { useEffect } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FormStoreProvider, useFormStore } from '../../../-model/store/form';

import DatabaseConnect from './DatabaseConnect';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
  useDevetekLocale: () => 'en',
}));

const { run, toaster, dialogs } = vi.hoisted(() => ({
  run: vi.fn(),
  toaster: vi.fn(),
  dialogs: [] as Array<{ title: string; content: string; variant: string }>,
}));
vi.mock('@/services/toaster', () => ({ useToaster: () => [toaster] }));
// The confirmation answers yes at once.
vi.mock('@/services/dialog', () => ({
  useDialog: () => [
    (payload: {
      title: string;
      content: string;
      variant: string;
      actions: { yes: () => Promise<void> };
    }) => {
      dialogs.push(payload);
      void payload.actions.yes();
    },
  ],
}));

let inventory: unknown[] = [];
vi.mock('@/shared/api', () => ({
  ApiServer: {
    Modules: {
      $Id: {
        useGet: (params: { options?: { skip?: boolean } }) => [
          params.options?.skip
            ? { $status: 'initial' }
            : { $status: 'success', modules: inventory, refreshed: true },
          vi.fn(),
        ],
      },
    },
  },
  ApiModule: {
    Detail: {
      $Name: {
        useGet: (params: { name: string; options?: { skip?: boolean } }) => [
          params.options?.skip
            ? { $status: 'initial' }
            : {
                $status: 'success',
                id: params.name,
                action_details: [{ name: 'install' }],
                input_catalog: { ref_name: 'v1.2.3' },
                resolved_commit: 'abc123',
              },
        ],
      },
    },
    Action: { $Name: { $Action: { Run: { doPost: run } } } },
  },
}));

let envText = '';

function EnvProbe(props: { onChange: (text: string) => void }) {
  const text = useFormStore((s) => s.runtimeEnvText);
  const { onChange } = props;
  useEffect(() => onChange(text), [onChange, text]);
  return null;
}

function renderHelper(runtimeEnvText = '') {
  return render(
    <FormStoreProvider
      hostedServerID={42}
      appName="My Blog"
      appSourceGithubRepo="dPanel-ID/wordpress-example"
      runtimeEnvText={runtimeEnvText}
    >
      <DatabaseConnect />
      <EnvProbe
        onChange={(text) => {
          envText = text;
        }}
      />
    </FormStoreProvider>,
  );
}

beforeEach(() => {
  run.mockResolvedValue({ $status: 'success', status: 'queued' });
  inventory = [{ module_name: 'mariadb', status: 'installed' }];
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  envText = '';
  dialogs.length = 0;
});

describe('DatabaseConnect', () => {
  it('creates the database and writes its generated password into the variables', async () => {
    renderHelper(
      'WORDPRESS_HOME=https://blog.example.com\nWORDPRESS_DB_PASSWORD=root',
    );
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });

    expect(run).toHaveBeenCalledTimes(1);
    const request = run.mock.calls[0]?.[0];
    expect(request).toMatchObject({
      name: 'mariadb-database',
      action: 'install',
      payload: {
        server_id: '42',
        variables: { database_name: 'my_blog', database_user: 'my_blog' },
        ref: { name: 'v1.2.3', expected_commit: 'abc123' },
      },
    });
    const password = request.payload.variables.database_password as string;
    expect(password).toMatch(/^[a-km-zA-HJ-NP-Z2-9_-]{24}$/);

    expect(envText.split('\n')).toEqual([
      'WORDPRESS_HOME=https://blog.example.com',
      `WORDPRESS_DB_PASSWORD=${password}`,
      'WORDPRESS_DB_HOST=127.0.0.1:3306',
      'WORDPRESS_DB_NAME=my_blog',
      'WORDPRESS_DB_USER=my_blog',
    ]);
    expect(screen.getByRole('status').textContent).toContain('created');
    // The password itself is never shown in the helper.
    expect(document.body.textContent).not.toContain(password);
    // WORDPRESS_DB_PASSWORD was already set: the confirmation said so.
    expect(dialogs[0]).toMatchObject({
      title: 'replaceTitle',
      variant: 'warning',
    });
    expect(dialogs[0]?.content).toContain(
      'replaceBody {"keys":"WORDPRESS_DB_PASSWORD"}',
    );
  });

  it('asks a plain confirmation when no variable is replaced', async () => {
    renderHelper('A=1');
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });
    expect(dialogs[0]).toMatchObject({
      title: 'confirmTitle',
      variant: 'info',
    });
  });

  it('creates a MongoDB database with the administrator password typed once', async () => {
    inventory = [
      {
        module_name: 'mongodb',
        status: 'installed',
        variables: { mongodb_net_port: 27018 },
      },
    ];
    renderHelper();
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });
    expect(run).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('adminPasswordRequired');

    fireEvent.change(screen.getByLabelText('adminPassword'), {
      target: { value: 'typed-admin-secret' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });
    const request = run.mock.calls[0]?.[0];
    expect(request).toMatchObject({
      name: 'mongodb-database',
      payload: {
        variables: {
          database_name: 'my_blog',
          database_user: 'my_blog',
          admin_password: 'typed-admin-secret',
        },
      },
    });
    const password = request.payload.variables.database_password as string;
    // No WordPress names for MongoDB: one connection string.
    expect(envText).toBe(
      `DATABASE_URL=mongodb://my_blog:${password}@127.0.0.1:27018/my_blog?authSource=my_blog`,
    );
    expect(envText).not.toContain('typed-admin-secret');
    expect(document.body.textContent).not.toContain('typed-admin-secret');
  });

  it('refuses a database name that already exists', async () => {
    inventory.push({
      module_name: 'mariadb-database',
      status: 'installed',
      installation_key: 'mariadb-database@my_blog',
    });
    renderHelper();
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });
    expect(run).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('nameTaken');
    expect(envText).toBe('');
  });

  it('leaves the variables alone when the API refuses', async () => {
    run.mockResolvedValue({ $status: 'failed', error: {} });
    renderHelper('A=1');
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'create' }));
      await Promise.resolve();
    });
    expect(run).toHaveBeenCalledTimes(1);
    expect(envText).toBe('A=1');
    expect(toaster).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error', title: 'failed' }),
    );
  });

  it('points to the Modules tab when the server has no database server', () => {
    inventory = [{ module_name: 'redis', status: 'installed' }];
    renderHelper();
    expect(document.body.textContent).toContain('noDatabaseServer');
    expect(screen.queryByRole('button', { name: 'open' })).toBeNull();
  });
});
