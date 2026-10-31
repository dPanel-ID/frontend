import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { CloudProjectCard } from '../../-lib/describe-cloud-project';
import { useEmit } from '../../-model/events';

export interface CloudProjectHandlers {
  openDetails: () => void;
  createServer: () => void;
  migrateOwnership: () => void;
  /** Absent when the account has no provider to pick a credential form by. */
  updateCredentials?: () => void;
  remove: () => void;
}

/** One place that turns an account card into the actions every view offers. */
export function useCloudProjectHandlers() {
  const emit = useEmit();
  const navigate = useNavigate();

  return useHandler((cloudProject: CloudProjectCard): CloudProjectHandlers => {
    const { id, name, provider, teamId, teamName } = cloudProject;

    return {
      openDetails: () =>
        emit('@cloud-projects/open--details', {
          cloudProjectId: id,
          cloudProjectName: name,
        }),
      createServer: () =>
        navigate({
          to: '/servers/create/vm-instant',
          search: provider ? { provider } : undefined,
        }),
      migrateOwnership: () =>
        emit('@cloud-projects/open--migrate-ownership', {
          id,
          name,
          teamName,
          teamId,
        }),
      updateCredentials: provider
        ? () =>
            emit('@cloud-projects/open--update-credentials', {
              id,
              name,
              provider,
            })
        : undefined,
      remove: () => emit('@cloud-projects/project--delete', { id, name }),
    };
  });
}
