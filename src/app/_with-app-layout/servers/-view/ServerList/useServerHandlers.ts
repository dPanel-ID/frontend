import { useNavigate } from '@tanstack/react-router';

import { canReinstallServer } from '@/entities/server/lib/describeServer';
import type { ServerCard } from '@/entities/server/rules/schema';

import { isMigrateOwnershipVisible } from '@/features/migrate-ownership-modal';

import { useEmit } from '../../-model/events';

/** Everything a row or card can do with one server. */
export interface ServerHandlers {
  openDetails: () => void;
  showStatus: () => void;
  /** Absent while Migrate Ownership is hidden. */
  migrateOwnership?: () => void;
  remove: () => void;
  /**
   * Absent while setup is running, where it would collide, and for a
   * cancelled, deleting or deleted server, which the API refuses.
   */
  reinstall?: () => void;
  /** Absent while setup is running; the address and ports are in use. */
  edit?: () => void;
}

/** Builds the handlers for a server; every view shares the same wiring. */
export function useServerHandlers() {
  const navigate = useNavigate();
  const emit = useEmit();

  return (server: ServerCard): ServerHandlers => {
    const busy = server.state.status === 'progress';

    return {
      openDetails: () =>
        navigate({ to: '/servers/$id', params: { id: server.id } }),
      showStatus: () =>
        emit('@resources::servers/server-status-info-dialog', server),
      migrateOwnership: isMigrateOwnershipVisible()
        ? () =>
            // Own servers often have no hostname; fall back to the address.
            emit('@resources::servers/server-migrate-ownership', {
              serverId: server.id,
              serverName: server.host.name || server.host.address || server.id,
              serverTeam: server.ownership.team,
              serverTeamId: server.ownership.teamId,
            })
        : undefined,
      remove: () =>
        emit('@resources::servers/machine-delete', {
          serverId: server.id,
          serverName: server.host.name,
          serverAddress: server.host.address,
          provider: server.cloud?.provider,
        }),
      reinstall: !canReinstallServer(server)
        ? undefined
        : () =>
            emit('@resources::servers/machine-reinstall', {
              serverId: server.id,
              serverName: server.host.name || server.host.address,
            }),
      edit: busy
        ? undefined
        : () => emit('@resources::servers/server-edit-sidepanel', server),
    };
  };
}
