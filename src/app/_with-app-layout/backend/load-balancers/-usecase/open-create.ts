import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

export default function useLbOpenCreateUsecase() {
  const navigate = useNavigate();

  const handleUsecase = useHandler(() => {
    navigate({
      to: '/backend/load-balancers/create',
      search: {},
    });
  });

  return [handleUsecase] as const;
}
