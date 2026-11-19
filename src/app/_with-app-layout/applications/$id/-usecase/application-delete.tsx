import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { ApplicationDeletePayload } from '../-rules/usecase-types';
import useApplicationDeleteFlow from '../../-usecase/application-delete';

/**
 * Delete from the application's own page: the same dialog as the list, then
 * back to the list once the application is gone.
 */
export default function useApplicationDeleteUsecase() {
  const navigate = useNavigate();
  const [deleteApplication] = useApplicationDeleteFlow({
    onSuccess: () => {
      void navigate({ to: '/applications' });
    },
  });

  const handleUsecase = useHandler((payload: ApplicationDeletePayload) => {
    deleteApplication({
      appName: payload.applicationName,
      id: payload.applicationId,
    });
  });

  return [handleUsecase] as const;
}
