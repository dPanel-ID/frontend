import { useState } from 'react';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

interface MemberActionError {
  message: string;
  retry: () => Promise<void>;
}

interface UseServerGroupMemberMutationsParams {
  groupId: string;
  onSuccess: () => void;
}

export function useServerGroupMemberMutations(
  params: UseServerGroupMemberMutationsParams,
) {
  const { groupId, onSuccess } = params;
  const [memberActionError, setMemberActionError] =
    useState<MemberActionError | null>(null);
  const [pendingMemberAction, setPendingMemberAction] = useState<
    'add' | 'replace' | `remove:${string}` | null
  >(null);

  const runMutation = async (
    actionKey: 'add' | 'replace' | `remove:${string}`,
    request: () => Promise<
      Awaited<ReturnType<typeof ApiHostGroup.Members.$Id.doPost>>
      | Awaited<ReturnType<typeof ApiHostGroup.Members.$Id.doPut>>
      | Awaited<ReturnType<typeof ApiHostGroup.Members.$Id.doDelete>>
    >,
  ) => {
    setPendingMemberAction(actionKey);
    setMemberActionError(null);

    const response = await request();

    setPendingMemberAction(null);

    if (response.$status === 'failed') {
      const message = getApiErrorDetail(response.error);
      const retry = async () => {
        await runMutation(actionKey, request);
      };

      setMemberActionError({
        message,
        retry,
      });

      throw new Error(message);
    }

    setMemberActionError(null);
    onSuccess();
  };

  const submitMembers = async (
    serverIds: string[],
    mode: 'add' | 'replace',
  ) => {
    if (serverIds.length === 0) {
      throw new Error('Select at least one server.');
    }

    await runMutation(
      mode,
      () =>
        mode === 'replace'
          ? ApiHostGroup.Members.$Id.doPut({
              id: groupId,
              serverIds,
            })
          : ApiHostGroup.Members.$Id.doPost({
              id: groupId,
              serverIds,
            }),
    );
  };

  const removeMember = async (serverId: string) => {
    await runMutation(`remove:${serverId}`, () =>
      ApiHostGroup.Members.$Id.doDelete({
        id: groupId,
        serverId,
      }),
    );
  };

  return {
    clearMemberActionError: () => setMemberActionError(null),
    isMutatingMembers: pendingMemberAction != null,
    memberActionError,
    pendingMemberAction,
    removeMember,
    submitMembers,
  } as const;
}
