import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { LbOpenDetailsPayload as Payload } from '../-rules/usecase-types';

export default function useLbOpenDetailsUsecase() {
  const navigate = useNavigate();

  const handleUsecase = useHandler((payload: Payload) => {
    navigate({
      to: '/backend/load-balancers/$id',
      params: {
        id: payload.id,
      },
      search: {},
    });
  });

  return [handleUsecase] as const;
}
