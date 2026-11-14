import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/libs/api-client/lib/client';
import { AdapterError } from '@/shared/libs/api-client/lib/error';
import type {
  ApiClientResponse,
} from '@/shared/libs/api-client/rules/types';

import { fetchGet } from './host-group.operation.execution.$operationId.$machineId';
import { canonicalHostGroupExecutionDetail } from './host-group.test-fixtures';

vi.mock('@/shared/libs/api-client/lib/client', () => ({
  apiClient: vi.fn(),
}));

const mockedApiClient = vi.mocked(apiClient);

function buildSafeDetail() {
  return canonicalHostGroupExecutionDetail;
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
    });

    await expect(
      fetchGet({
        machineId: 'server-1',
        operationId: 'operation-1',
      }),
    ).resolves.toMatchObject({
      $status: 'success',
      execution: {
        id: 'exec_1',
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

  it('rejects scoped execution responses that omit required safe fields', async () => {
    mockedApiClient.mockResolvedValue({
      $status: 'success',
      $statusCode: 200,
      ...buildSafeDetail(),
      execution: {
        ...buildSafeDetail().execution,
        machine_id: undefined,
      },
    } as ApiClientResponse<unknown>);

    const response = await fetchGet({
      machineId: 'server-1',
      operationId: 'operation-1',
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });
});
