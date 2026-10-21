import { useNavigate } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { SshKeyCard } from '../../-lib/describe-ssh-key';
import { useEmit } from '../../-model/events';

export interface SshKeyHandlers {
  openDetails: () => void;
  copyPublicKey: () => void;
  createServer: () => void;
  migrateOwnership: () => void;
  remove: () => void;
}

/** One place that turns a key card into the actions every view offers. */
export function useSshKeyHandlers() {
  const emit = useEmit();
  const navigate = useNavigate();

  return useHandler((sshKey: SshKeyCard): SshKeyHandlers => {
    const { id, name, publicKey, teamId, teamName } = sshKey;

    return {
      openDetails: () =>
        emit('@ssh-keys/open--details', { sshKeyId: id, sshKeyName: name }),
      copyPublicKey: () =>
        emit('@ssh-keys/ssh-key--copy-public-key', { publicKey }),
      createServer: () => navigate({ to: '/servers/create' }),
      migrateOwnership: () =>
        emit('@ssh-keys/open--migrate-ownership', {
          id,
          name,
          teamName,
          teamId,
        }),
      remove: () => emit('@ssh-keys/ssh-key--delete', { id, name }),
    };
  });
}
