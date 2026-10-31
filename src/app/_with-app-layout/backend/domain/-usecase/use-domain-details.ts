import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { DomainDetailsPayload as Payload } from '../-rules/usecase-types';

/** Opens a domain's own page, with its records and their search. */
export default function useOpenDetailsUsecase() {
  const navigate = useNavigate();

  const handleUsecase = useHandler((domainId: Payload) => {
    navigate({
      to: '/backend/domain/$domainId',
      params: { domainId: String(domainId) },
    });
  });

  return [handleUsecase] as const;
}
