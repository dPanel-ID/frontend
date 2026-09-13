import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';

import * as HostGroupCreateApi from './host-group.create';
import * as HostGroupMembersApi from './host-group.members.$id';

vi.mock('@/shared/libs/api-client/lib/apiDoPost', () => ({
  apiDoPost: vi.fn(),
}));

const mockedApiDoPost = vi.mocked(apiDoPost);

describe('host-group null-success mutations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedApiDoPost.mockResolvedValue({
      $status: 'success',
    });
  });

  it('treats group delete data:null envelopes as success', async () => {
    await expect(
      HostGroupCreateApi.doDelete({
        id: 'hg_1',
      }),
    ).resolves.toMatchObject({
      $status: 'success',
    });
  });

  it('treats replace-members data:null envelopes as success', async () => {
    await expect(
      HostGroupMembersApi.doPut({
        id: 'hg_1',
        serverIds: [],
      }),
    ).resolves.toMatchObject({
      $status: 'success',
    });
  });

  it('treats add-members data:null envelopes as success', async () => {
    await expect(
      HostGroupMembersApi.doPost({
        id: 'hg_1',
        serverIds: ['101'],
      }),
    ).resolves.toMatchObject({
      $status: 'success',
    });
  });

  it('treats remove-member data:null envelopes as success', async () => {
    await expect(
      HostGroupMembersApi.doDelete({
        id: 'hg_1',
        serverId: '101',
      }),
    ).resolves.toMatchObject({
      $status: 'success',
    });
  });
});
