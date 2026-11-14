import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import { AdapterError } from '@/shared/libs/api-client/lib/error';

import {
  canonicalLegacyServerModuleActionResponse,
  canonicalModuleHostGroupActionResponse,
} from './host-group.test-fixtures';
import { doPost } from './module.action.$name.$action.run';

vi.mock('@/shared/libs/api-client/lib/apiDoPost', () => ({
  apiDoPost: vi.fn(),
}));

const mockedApiDoPost = vi.mocked(apiDoPost);

describe('module host-group action response boundary', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('accepts canonical host-group module action responses', async () => {
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
      ...canonicalModuleHostGroupActionResponse,
    });

    await expect(
      doPost({
        name: 'nodejs',
        action: 'install',
        payload: {
          target: {
            type: 'hostgroup',
            id: 'hg_1',
          },
        },
      }),
    ).resolves.toMatchObject({
      $status: 'success',
      operation_id: 'hgop_module_1',
    });
  });

  it('rejects malformed host-group module action responses as adapter failures', async () => {
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
      ...canonicalModuleHostGroupActionResponse,
      target: {
        type: 'server',
        id: '101',
      },
    } as unknown as Awaited<ReturnType<typeof doPost>>);

    const response = await doPost({
      name: 'nodejs',
      action: 'install',
      payload: {
        target: {
          type: 'hostgroup',
          id: 'hg_1',
        },
      },
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });

  it('preserves legacy server_id response precedence even when a host-group target is also sent', async () => {
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
      ...canonicalLegacyServerModuleActionResponse,
    });

    await expect(
      doPost({
        name: 'nodejs',
        action: 'install',
        payload: {
          server_id: '101',
          target: {
            type: 'hostgroup',
            id: 'hg_1',
          },
        },
      }),
    ).resolves.toMatchObject({
      $status: 'success',
      execution_id: 'exec_server_1',
      target: {
        type: 'server',
        id: '101',
      },
    });
  });
});
