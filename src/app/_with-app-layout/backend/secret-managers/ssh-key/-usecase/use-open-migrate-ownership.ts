import { useMigrateOwnershipModal } from '@/features/migrate-ownership-modal';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { SshKeyMigrateOwnershipPayload as Payload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

export default function useOpenSshKeyMigrateOwnershipUsecase(params: Params) {
  const { onSuccess } = params;

  const [openModalMigrateOwnership] = useMigrateOwnershipModal();

  const handleUsecase = useHandler((payload: Payload) => {
    openModalMigrateOwnership({
      mod: {
        type: 'ssh-key',
        moduleId: String(payload.id),
        moduleName: payload.name,
        moduleTeam: payload.teamName
          ? {
              name: payload.teamName,
              id: payload.teamId ?? undefined,
            }
          : undefined,
      },
      onSuccess,
    });
  });

  return [handleUsecase] as const;
}
