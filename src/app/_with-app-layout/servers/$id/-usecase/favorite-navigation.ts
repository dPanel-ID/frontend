import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useServerDataModel } from '../-model/server-data';
import type { FavoriteNavigationPayload as Payload } from '../-rules/usecase-types';

export default function useFavoriteNavigationUsecase() {
  const [serverId] = useServerDataModel((s) => [s.serverId]);

  const navigate = useNavigate();

  const handleUsecase = useHandler((_payload: Payload) => {
    navigate({
      to: '/discover/modules',
      search: {
        serverId,
      },
    });
  });

  return [handleUsecase] as const;
}
