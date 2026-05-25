import { useServerModulesDiscoverSidepanel } from '@/features/server-modules-discover-sidepanel';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useServerDataModel } from '../-model/server-data';
import type { FavoriteNavigationPayload as Payload } from '../-rules/usecase-types';

export default function useFavoriteNavigationUsecase() {
  const [serverId, detail] = useServerDataModel((s) => [s.serverId, s.detail]);
  const [openServerModulesDiscoverSidepanel] =
    useServerModulesDiscoverSidepanel();

  const serverName =
    detail.$status === 'success' ? detail.host.name : undefined;

  const handleUsecase = useHandler((_payload: Payload) => {
    openServerModulesDiscoverSidepanel({
      serverId: String(serverId),
      serverName,
    });
  });

  return [handleUsecase] as const;
}
