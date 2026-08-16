// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdapterError } from '@/shared/libs/api-client/lib/error';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  ApiClientResponse,
} from '@/shared/libs/api-client/rules/types';

import * as HostGroupAgentCommandApi from './host-group.operation.agent-command.$operationId.$machineId';
import * as HostGroupDetailApi from './host-group.detail.$id';
import * as HostGroupOperationApi from './host-group.operation.$id';
import { parseHostGroupListPayload } from './host-group.parsers';

vi.mock('@/shared/libs/api-client/lib/client', () => ({
  apiClient: vi.fn(),
}));
const mockedApiClient = vi.mocked(apiClient);

describe('host-group API boundaries', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects invalid host-group list payloads', () => {
    expect(() =>
      parseHostGroupListPayload([
        {
          id: 'hg-1',
          name: 'Primary',
          workspace_id: 'ws-1',
          workspace_type: 'group',
          member_count: 2,
          created_at: '2026-08-16T10:00:00Z',
          updated_at: '2026-08-16T10:00:00Z',
          unexpected: true,
        },
      ]),
    ).toThrow();
  });

  it('rejects invalid host-group detail fetch responses', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      id: 'hg-1',
      description: 'missing required fields',
    } as ApiClientResponse<unknown>);

    const response = await HostGroupDetailApi.fetchGet({ id: 'hg-1' });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });

  it('rejects invalid host-group operation detail fetch responses', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      operation: {
        id: 'op-1',
        host_group_id: 'hg-1',
        type: 'module.install',
        status: 'queued',
        request: {
          action: 'install',
        },
        target_count: 1,
        succeeded_count: 0,
        failed_count: 0,
        created_at: '2026-08-16T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
        extra: true,
      },
      targets: [],
    } as ApiClientResponse<unknown>);

    const response = await HostGroupOperationApi.fetchGet({ id: 'op-1' });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });

  it('rejects broad agent-command detail fields at the fetch boundary', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      command: {
        id: 'cmd-1',
        machine_id: 'machine-1',
        command_type: 'module.inventory',
        status: 'queued',
        created_at: '2026-08-16T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
        payload: {
          private: true,
        },
      },
    } as ApiClientResponse<unknown>);

    const response = await HostGroupAgentCommandApi.fetchGet({
      machineId: 'machine-1',
      operationId: 'op-1',
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });
});
