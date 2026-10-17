import { useNavigate } from '@tanstack/react-router';

import type { ServerCard } from '@/entities/server/rules/schema';

import { useEmit } from '../../-model/events';

/** Everything a row or card can do with one server. */
export interface ServerHandlers {
  openDetails: () => void;
  showStatus: () => void;
  migrateOwnership: () => void;
  remove: () => void;
  /** Absent while setup is running; reinstalling would collide with it. */
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
      migrateOwnership: () =>
        // Own servers often have no hostname; fall back to the address.
        emit('@resources::servers/server-migrate-ownership', {
          serverId: server.id,
          serverName: server.host.name || server.host.address || server.id,
          serverTeam: server.ownership.team,
          serverTeamId: server.ownership.teamId,
        }),
      remove: () =>
        emit('@resources::servers/machine-delete', {
          serverId: server.id,
          serverName: server.host.name,
          serverAddress: server.host.address,
          provider: server.cloud?.provider,
        }),
      reinstall: busy
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
