import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import { AdapterError } from '@/shared/libs/api-client/lib/error';

import { doPost } from './deploy.create';
import { canonicalDeploymentHostGroupActionResponse } from './host-group.test-fixtures';

vi.mock('@/shared/libs/api-client/lib/apiDoPost', () => ({
  apiDoPost: vi.fn(),
}));

const mockedApiDoPost = vi.mocked(apiDoPost);

describe('deployment host-group action response boundary', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('accepts canonical host-group deployment action responses', async () => {
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
      ...canonicalDeploymentHostGroupActionResponse,
    } as Awaited<ReturnType<typeof doPost>>);

    await expect(
      doPost({
        applicationId: '13',
        artifactId: '99',
        workerId: '',
        target: {
          type: 'hostgroup',
          id: 'hg_1',
        },
      }),
    ).resolves.toMatchObject({
      $status: 'success',
      operation_id: 'hgop_deploy_1',
    });
  });

  it('rejects malformed host-group deployment action responses as adapter failures', async () => {
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
      ...canonicalDeploymentHostGroupActionResponse,
      status: 'queued-ish',
    } as Awaited<ReturnType<typeof doPost>>);

    const response = await doPost({
      applicationId: '13',
      artifactId: '99',
      workerId: '',
      target: {
        type: 'hostgroup',
        id: 'hg_1',
      },
    });

    expect(response.$status).toBe('failed');
    if (response.$status !== 'failed') throw new Error('Expected failure');
    expect(response.kind).toBe('adapter');
    expect(response.error).toBeInstanceOf(AdapterError);
  });
});
