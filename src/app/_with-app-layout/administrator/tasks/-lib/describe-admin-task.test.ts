import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import { isAccessDenied } from '../../-lib/access-error';

import {
  formatDuration,
  summarizeAdminTasks,
  toAdminTaskRow,
  toAdminTaskRows,
} from './describe-admin-task';

const NOW = Date.parse('2026-11-03T10:00:00Z');

describe('toAdminTaskRow', () => {
  it('maps a task a worker has claimed', () => {
    const row = toAdminTaskRow(
      {
        execution_id: '0b8c1d2e-aaaa-bbbb-cccc-000000000001',
        type: ' deploy ',
        status: 'running',
        workspace_id: 'ws-1',
        machine_id: 'm-7',
        machine_hostname: 'web-1',
        created_at: '2026-11-03T09:00:00Z',
        last_event_message: 'Installing packages',
        idle_seconds: 125.7,
        gateway: {
          task_id: 't-1',
          state: 'claimed',
          worker_id: 'worker-a',
          queued_at: '2026-11-03T09:00:01Z',
          last_heartbeat_at: '2026-11-03T09:59:30Z',
        },
        can_reclaim: true,
        cleanup: { verdict: 'active', reasons: ['worker_heartbeat'] },
        created_by: {
          id: '42',
          username: 'ayu',
          fullname: 'Ayu Lestari',
          avatar_url: 'https://example.test/ayu.png',
        },
      },
      NOW,
    );

    expect(row).toEqual({
      executionId: '0b8c1d2e-aaaa-bbbb-cccc-000000000001',
      shortId: '0b8c1d2e',
      type: 'deploy',
      status: 'running',
      rawStatus: 'running',
      workspaceId: 'ws-1',
      serverHostname: 'web-1',
      serverId: 'm-7',
      module: null,
      workerId: 'worker-a',
      gatewayState: 'claimed',
      heartbeatAgeSeconds: 30,
      idleSeconds: 125,
      createdAt: '2026-11-03T09:00:00Z',
      ageSeconds: 3600,
      lastEventMessage: 'Installing packages',
      canReclaim: true,
      waitingForWorker: false,
      serverDeleted: false,
      cleanup: 'active',
      cleanupReasons: ['worker_heartbeat'],
      createdBy: {
        name: 'Ayu Lestari',
        username: 'ayu',
        avatarUrl: 'https://example.test/ayu.png',
      },
    });
  });

  it('reads a deleted server as safe to delete and drops unknown reasons', () => {
    const row = toAdminTaskRow(
      {
        execution_id: 'abc',
        status: 'queued',
        server_deleted: true,
        cleanup: {
          verdict: 'safe_to_delete',
          reasons: ['server_deleted', 'something_new'],
        },
        created_by: { username: 'dpanel01' },
      },
      NOW,
    );

    expect(row).toMatchObject({
      serverDeleted: true,
      cleanup: 'safe_to_delete',
      cleanupReasons: ['server_deleted'],
      createdBy: { name: 'dpanel01', username: 'dpanel01' },
    });
  });

  it('marks a task the API did not assess', () => {
    const row = toAdminTaskRow(
      { execution_id: 'abc', cleanup: { verdict: 'later' } },
      NOW,
    );

    expect(row).toMatchObject({ cleanup: 'unknown', createdBy: null });
  });

  it('drops a record without an execution ID', () => {
    expect(toAdminTaskRow({ execution_id: '  ', status: 'running' }, NOW)).toBe(
      null,
    );
  });

  it('survives a sparse record with an unknown status and no gateway', () => {
    const row = toAdminTaskRow({ execution_id: 'abc', status: '' }, NOW);

    expect(row).toMatchObject({
      shortId: 'abc',
      type: null,
      status: 'unknown',
      rawStatus: null,
      workspaceId: null,
      serverHostname: null,
      serverId: null,
      workerId: null,
      gatewayState: 'none',
      heartbeatAgeSeconds: null,
      idleSeconds: null,
      createdAt: null,
      ageSeconds: null,
      lastEventMessage: null,
      canReclaim: false,
      waitingForWorker: false,
    });
  });

  it('keeps a status it does not know, and reads known ones in any case', () => {
    expect(
      toAdminTaskRow({ execution_id: 'a', status: 'paused' }, NOW),
    ).toMatchObject({ status: 'unknown', rawStatus: 'paused' });
    expect(
      toAdminTaskRow({ execution_id: 'a', status: 'QUEUED' }, NOW),
    ).toMatchObject({ status: 'queued' });
  });

  it('counts a queued task nothing holds as waiting for a worker', () => {
    expect(
      toAdminTaskRow({ execution_id: 'a', status: 'queued' }, NOW)
        ?.waitingForWorker,
    ).toBe(true);
    expect(
      toAdminTaskRow(
        { execution_id: 'a', status: 'pending', gateway: null },
        NOW,
      )?.waitingForWorker,
    ).toBe(true);
    expect(
      toAdminTaskRow({ execution_id: 'a', status: 'running' }, NOW)
        ?.waitingForWorker,
    ).toBe(false);
  });

  it('treats a held, unclaimed task as waiting whatever its status', () => {
    const row = toAdminTaskRow(
      {
        execution_id: 'a',
        status: 'running',
        gateway: { state: 'queued', queued_at: '2026-11-03T09:00:00Z' },
      },
      NOW,
    );

    expect(row).toMatchObject({
      gatewayState: 'waiting',
      workerId: null,
      waitingForWorker: true,
    });
  });

  it('ignores unreadable dates and negative idle times', () => {
    const row = toAdminTaskRow(
      {
        execution_id: 'a',
        created_at: 'not a date',
        idle_seconds: -5,
        gateway: {
          state: 'claimed',
          last_heartbeat_at: '2026-11-03T10:00:09Z',
        },
      },
      NOW,
    );

    expect(row?.ageSeconds).toBeNull();
    expect(row?.idleSeconds).toBeNull();
    // A heartbeat slightly ahead of the browser clock reads as just now.
    expect(row?.heartbeatAgeSeconds).toBe(0);
  });
});

describe('toAdminTaskRows', () => {
  it('survives an empty or missing list', () => {
    expect(toAdminTaskRows(undefined, NOW)).toEqual([]);
    expect(toAdminTaskRows(null, NOW)).toEqual([]);
    expect(toAdminTaskRows([{}, { execution_id: 'a' }], NOW)).toHaveLength(1);
  });
});

describe('summarizeAdminTasks', () => {
  it('counts running, waiting and claimed tasks', () => {
    const rows = toAdminTaskRows(
      [
        { execution_id: '1', status: 'running', gateway: { state: 'claimed' } },
        { execution_id: '2', status: 'queued', gateway: { state: 'queued' } },
        { execution_id: '3', status: 'pending' },
        { execution_id: '4', status: 'running' },
      ],
      NOW,
    );

    expect(summarizeAdminTasks(rows)).toEqual({
      total: 4,
      running: 2,
      waitingForWorker: 2,
      claimed: 1,
      safeToDelete: 0,
    });
  });

  it('reports zero for an empty list', () => {
    expect(summarizeAdminTasks([])).toEqual({
      total: 0,
      running: 0,
      waitingForWorker: 0,
      claimed: 0,
      safeToDelete: 0,
    });
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [-3, '0s'],
    [45, '45s'],
    [310, '5m 10s'],
    [3_600, '1h'],
    [10_920, '3h 2m'],
    [187_200, '2d 4h'],
    [86_401, '1d'],
  ])('formats %d seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('isAccessDenied', () => {
  const apiError = (code: number) =>
    new BaseResponseError({ code, status: 'failed', error: 'nope' });

  it('recognises 401 and 403 from the API', () => {
    expect(isAccessDenied({ kind: 'api', error: apiError(403) })).toBe(true);
    expect(isAccessDenied({ kind: 'api', error: apiError(401) })).toBe(true);
  });

  it('recognises a bare axios 403', () => {
    const error = new AxiosError(
      'Forbidden',
      'ERR_BAD_REQUEST',
      undefined,
      null,
      {
        status: 403,
      } as never,
    );

    expect(isAccessDenied({ kind: 'api', error })).toBe(true);
  });

  it('leaves other failures retryable', () => {
    expect(isAccessDenied({ kind: 'api', error: apiError(503) })).toBe(false);
    expect(isAccessDenied({ kind: 'general', error: Error('offline') })).toBe(
      false,
    );
  });
});
