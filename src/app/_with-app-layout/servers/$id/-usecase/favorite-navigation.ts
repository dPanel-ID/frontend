import { useNavigate } from '@tanstack/react-router';

import { useServerModulesDiscoverSidepanel } from '@/features/server-modules-discover-sidepanel';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useServerDataModel } from '../-model/server-data';
import type { FavoriteNavigationPayload as Payload } from '../-rules/usecase-types';

export default function useFavoriteNavigationUsecase() {
  const [serverId, detail] = useServerDataModel((s) => [s.serverId, s.detail]);
  const [openServerModulesDiscoverSidepanel] =
    useServerModulesDiscoverSidepanel();
  const navigate = useNavigate();

  const serverName =
    detail.$status === 'success' ? detail.host.name : undefined;
  const hostGroupId =
    detail.$status === 'success' ? detail.hostGroupId : undefined;

  const handleUsecase = useHandler((_payload: Payload) => {
    openServerModulesDiscoverSidepanel({
      hostGroupId,
      onHostGroupOperationQueued: (groupId, operationId) => {
        navigate({
          to: '/servers/groups/$id',
          params: {
            id: groupId,
          },
          search: {
            operationId,
          },
        });
      },
      serverId: String(serverId),
      serverName,
    });
  });

  return [handleUsecase] as const;
}
