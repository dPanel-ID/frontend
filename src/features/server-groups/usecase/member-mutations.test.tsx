// @vitest-environment jsdom

import {
  act,
  renderHook,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiHostGroup } from '@/shared/api';

import {
  assertMemberSelection,
  useServerGroupMemberMutations,
} from './member-mutations';

vi.mock('@/shared/api', () => ({
  ApiHostGroup: {
    Members: {
      $Id: {
        doDelete: vi.fn(),
        doPost: vi.fn(),
        doPut: vi.fn(),
      },
    },
  },
}));

const mockedMembersApi = vi.mocked(ApiHostGroup.Members.$Id);

describe('assertMemberSelection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedMembersApi.doDelete.mockResolvedValue({
      $status: 'success',
    } as Awaited<ReturnType<typeof mockedMembersApi.doDelete>>);
    mockedMembersApi.doPost.mockResolvedValue({
      $status: 'success',
    } as Awaited<ReturnType<typeof mockedMembersApi.doPost>>);
    mockedMembersApi.doPut.mockResolvedValue({
      $status: 'success',
    } as Awaited<ReturnType<typeof mockedMembersApi.doPut>>);
  });

  it('allows explicitly replacing members with an empty set', () => {
    expect(() => assertMemberSelection([], 'replace')).not.toThrow();
  });

  it('still rejects an empty add request', () => {
    expect(() => assertMemberSelection([], 'add')).toThrowError(
      'Select at least one server.',
    );
  });

  it('treats replace success with data:null as a successful UI mutation', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useServerGroupMemberMutations({
        groupId: 'hg_1',
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.submitMembers([], 'replace');
    });

    expect(mockedMembersApi.doPut).toHaveBeenCalledWith({
      id: 'hg_1',
      serverIds: [],
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('treats add success with data:null as a successful UI mutation', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useServerGroupMemberMutations({
        groupId: 'hg_1',
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.submitMembers(['101'], 'add');
    });

    expect(mockedMembersApi.doPost).toHaveBeenCalledWith({
      id: 'hg_1',
      serverIds: ['101'],
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('treats remove success with data:null as a successful UI mutation', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useServerGroupMemberMutations({
        groupId: 'hg_1',
        onSuccess,
      }),
    );

    await act(async () => {
      await result.current.removeMember('101');
    });

    expect(mockedMembersApi.doDelete).toHaveBeenCalledWith({
      id: 'hg_1',
      serverId: '101',
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
