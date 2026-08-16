import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdapterError } from '@/shared/libs/api-client/lib/error';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  ApiClientResponse,
} from '@/shared/libs/api-client/rules/types';

import { fetchGet } from './host-group.operation.execution.$operationId.$machineId';

vi.mock('@/shared/libs/api-client/lib/client', () => ({
  apiClient: vi.fn(),
}));

const mockedApiClient = vi.mocked(apiClient);

function buildSafeDetail() {
  return {
    execution: {
      id: 'execution-1',
      type: 'deploy',
      status: 'running',
      organization_id: 'org-1',
      actor_subject: 'user-1',
      machine_id: 'server-1',
      module: 'deploy',
      module_id: 'module-1',
      started_at: '2026-08-16T10:00:00Z',
      finished_at: '2026-08-16T10:05:00Z',
      created_at: '2026-08-16T10:00:00Z',
      updated_at: '2026-08-16T10:05:00Z',
    },
    events: [],
    events_source: 'uptrace',
    events_stored: false,
    events_message: 'events are not exposed for scoped detail',
    events_retention_days: 0,
    events_retention_expires_at: '2026-08-16T10:05:00Z',
    events_retained: false,
    events_unavailable_reason: 'retention',
  };
}

describe('host-group scoped execution detail client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns parsed scoped execution detail from fetchGet success responses', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      ...buildSafeDetail(),
    } as ApiClientResponse<unknown>);

    await expect(
      fetchGet({
        machineId: 'server-1',
        operationId: 'operation-1',
      }),
    ).resolves.toMatchObject({
      $status: 'success',
      execution: {
        id: 'execution-1',
      },
      events: [],
    });
  });

  it('rejects non-empty events at the fetchGet client boundary', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      ...buildSafeDetail(),
      events: [
        {
          id: 'event-1',
          message: 'private event payload',
        },
      ],
    } as ApiClientResponse<unknown>);

    const response = await fetchGet({
      machineId: 'server-1',
      operationId: 'operation-1',
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
    expect(response.error.message).toContain('events');
  });

  it('rejects broad execution detail fields at the fetchGet client boundary', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      execution: {
        ...buildSafeDetail().execution,
        trace_id: 'trace-1',
      },
      events: [],
    } as ApiClientResponse<unknown>);

    const response = await fetchGet({
      machineId: 'server-1',
      operationId: 'operation-1',
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
    expect(response.error.message).toContain('trace_id');
  });
});
