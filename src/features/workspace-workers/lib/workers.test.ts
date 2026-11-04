import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import {
  describeWorkerTarget,
  formatEnvBlock,
  formatLastSeen,
  isWorkersUnavailable,
  normalizeMode,
  parseRepository,
  toWorkerSecretResult,
  toWorkersView,
} from './workers';

describe('parseRepository', () => {
  it.each([
    ['acme/dpanel-workers', 'acme/dpanel-workers'],
    ['  acme/dpanel-workers  ', 'acme/dpanel-workers'],
    ['https://github.com/acme/dpanel-workers', 'acme/dpanel-workers'],
    ['https://github.com/acme/dpanel-workers.git', 'acme/dpanel-workers'],
    ['github.com/acme/dpanel-workers/', 'acme/dpanel-workers'],
    ['https://www.github.com/acme/repo/tree/main/.github', 'acme/repo'],
    ['git@github.com:acme/repo.git', 'acme/repo'],
    ['https://github.com/acme/repo?tab=readme', 'acme/repo'],
    ['Acme-Inc/My.Repo_1', 'Acme-Inc/My.Repo_1'],
  ])('%s -> %s', (input, expected) => {
    expect(parseRepository(input)).toBe(expected);
  });

  it.each([
    '',
    'acme',
    'acme/',
    '/repo',
    'acme/repo/extra',
    'https://gitlab.com/acme/repo',
    '-acme/repo',
    'ac me/repo',
    'acme/..',
  ])('rejects %o', (input) => {
    expect(parseRepository(input)).toBeNull();
  });
});

describe('formatEnvBlock', () => {
  it('puts the executor keys first and the rest in name order', () => {
    expect(
      formatEnvBlock({
        ZED: 'z',
        DPANEL_EXECUTOR_MANAGER_URL: 'https://pawon.devetek.app',
        ALPHA: 'a',
        DPANEL_EXECUTOR_WORKSPACE_ID: 'group:5209311491061018854',
        DPANEL_EXECUTOR_TOKEN: 'dpw_test',
      }),
    ).toBe(
      [
        'DPANEL_EXECUTOR_TOKEN=dpw_test',
        'DPANEL_EXECUTOR_WORKSPACE_ID=group:5209311491061018854',
        'DPANEL_EXECUTOR_MANAGER_URL=https://pawon.devetek.app',
        'ALPHA=a',
        'ZED=z',
      ].join('\n'),
    );
  });

  it('quotes values a shell would split', () => {
    expect(formatEnvBlock({ A: 'two words', B: 'say "hi" $HOME' })).toBe(
      'A="two words"\nB="say \\"hi\\" \\$HOME"',
    );
  });

  it('is empty without an environment', () => {
    expect(formatEnvBlock(undefined)).toBe('');
    expect(formatEnvBlock(null)).toBe('');
    expect(formatEnvBlock({})).toBe('');
  });
});

describe('normalizeMode', () => {
  it.each([
    ['private', 'private'],
    [' PRIVATE ', 'private'],
    ['shared', 'shared'],
    ['', 'shared'],
    [undefined, 'shared'],
    ['something-new', 'shared'],
  ])('%o -> %s', (input, expected) => {
    expect(normalizeMode(input)).toBe(expected);
  });
});

describe('describeWorkerTarget', () => {
  it('shows the executor ID of a VM worker', () => {
    expect(
      describeWorkerTarget({
        id: 'wk_1',
        type: 'vm',
        executor_id: 'office-01',
      }),
    ).toBe('office-01');
  });

  it('shows repository, workflow and ref of a GitHub worker', () => {
    expect(
      describeWorkerTarget({
        id: 'wk_2',
        type: 'github',
        repository: 'acme/ci',
        workflow: 'dpanel-worker.yml',
        ref: 'main',
      }),
    ).toBe('acme/ci · dpanel-worker.yml@main');
  });

  it('degrades when fields are missing', () => {
    expect(
      describeWorkerTarget({ id: 'wk_3', type: 'github', repository: 'a/b' }),
    ).toBe('a/b');
    expect(describeWorkerTarget({ id: 'wk_4', type: 'github' })).toBeNull();
    expect(describeWorkerTarget({ id: 'wk_5', type: 'vm' })).toBeNull();
  });
});

describe('toWorkersView', () => {
  it('maps a production-shaped response', () => {
    const view = toWorkersView({
      scope: { type: 'group', id: '5209311491061018854' },
      mode: 'private',
      workspace_header: 'group:5209311491061018854',
      manager_url: 'https://pawon.devetek.app',
      workers: [
        {
          id: 'wk_1',
          name: 'office-vm',
          type: 'vm',
          executor_id: 'office-vm-01',
          token_hint: '…a1b2',
          created_at: '2026-11-01T10:00:00Z',
          last_seen_at: null,
        },
        { id: 'wk_2', name: '', type: 'lambda' },
      ],
    });

    expect(view).toEqual({
      mode: 'private',
      scopeType: 'group',
      workspaceHeader: 'group:5209311491061018854',
      managerUrl: 'https://pawon.devetek.app',
      workers: [
        {
          id: 'wk_1',
          name: 'office-vm',
          kind: 'vm',
          target: 'office-vm-01',
          tokenHint: '…a1b2',
          createdAt: '2026-11-01T10:00:00Z',
          lastSeenAt: null,
        },
        {
          id: 'wk_2',
          name: 'wk_2',
          kind: 'unknown',
          target: null,
          tokenHint: null,
          createdAt: null,
          lastSeenAt: null,
        },
      ],
    });
  });

  it('treats a missing configuration as shared with no workers', () => {
    expect(toWorkersView({ workers: null })).toMatchObject({
      mode: 'shared',
      scopeType: 'personal',
      workers: [],
    });
  });
});

describe('toWorkerSecretResult', () => {
  it('keeps the token and builds the environment of a VM worker', () => {
    const result = toWorkerSecretResult({
      worker: { id: 'wk_1', name: 'office', type: 'vm', executor_id: 'o-1' },
      token: 'dpw_test',
      env: { DPANEL_EXECUTOR_TOKEN: 'dpw_test' },
    });

    expect(result.token).toBe('dpw_test');
    expect(result.envBlock).toBe('DPANEL_EXECUTOR_TOKEN=dpw_test');
    expect(result.workflowYaml).toBeNull();
  });

  it('keeps the workflow of a GitHub worker', () => {
    const result = toWorkerSecretResult({
      worker: { id: 'wk_2', type: 'github', repository: 'a/b' },
      workflow_yaml: 'name: dPanel worker\n',
    });

    expect(result.token).toBeNull();
    expect(result.envBlock).toBeNull();
    expect(result.workflowYaml).toBe('name: dPanel worker\n');
  });
});

describe('formatLastSeen', () => {
  it('is null for missing or invalid dates', () => {
    expect(formatLastSeen(null, 'en')).toBeNull();
    expect(formatLastSeen('not a date', 'en')).toBeNull();
    expect(formatLastSeen('0001-01-01T00:00:00Z', 'en')).toBeNull();
  });

  it('describes a recent date relatively', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatLastSeen(fiveMinutesAgo, 'en')).toBe('5 minutes ago');
  });
});

describe('isWorkersUnavailable', () => {
  const axiosError = (status: number) =>
    new AxiosError('failed', undefined, undefined, undefined, {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: null,
    });

  it.each([404, 401, 403])('hides the card on HTTP %i', (status) => {
    expect(
      isWorkersUnavailable({ kind: 'api', error: axiosError(status) }),
    ).toBe(true);
  });

  it('keeps the card (with a retry) on other failures', () => {
    expect(isWorkersUnavailable({ kind: 'api', error: axiosError(500) })).toBe(
      false,
    );
    expect(
      isWorkersUnavailable({
        kind: 'api',
        error: new BaseResponseError({
          code: 409,
          status: 'failed',
          error: 'x',
        }),
      }),
    ).toBe(false);
    expect(
      isWorkersUnavailable({ kind: 'general', error: new Error('offline') }),
    ).toBe(false);
  });
});
