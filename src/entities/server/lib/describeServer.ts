import { getCloudProviderLabel } from '@/shared/presentation/molecules/CloudProviderLogo';

import type { ServerCard } from '../rules/schema';

type ServerLike = Pick<ServerCard, 'id' | 'host' | 'cloud' | 'system'>;

/** The name to show for a server: hostname, else address, else its ID. */
export function serverDisplayName(server: ServerLike) {
  return server.host.name || server.host.address || `Server ${server.id}`;
}

/** True when dPanel created the VM at a cloud provider it knows. */
export function isCloudServer(server: ServerLike) {
  const provider = server.cloud?.provider;
  return !!provider && provider !== 'other';
}

/** Display name of the server's provider, or undefined for own servers. */
export function serverProviderLabel(server: ServerLike) {
  if (!isCloudServer(server)) return undefined;
  return (
    getCloudProviderLabel(server.cloud?.provider) ?? server.cloud?.provider
  );
}

/** "Ubuntu 24.04" from the reported distributor and version. */
export function serverSystemLabel(server: ServerLike) {
  const { name, version } = server.system;
  if (!name) return undefined;

  const prettyName = name.charAt(0).toUpperCase() + name.slice(1);
  return version ? `${prettyName} ${version}` : prettyName;
}

/**
 * Reinstall runs setup again on the same server record. It collides with a
 * setup in progress, and the API refuses it for a cancelled, deleting or
 * deleted server: that host comes back only as a new server with a new ID.
 */
export function canReinstallServer(server: Pick<ServerCard, 'state'>) {
  return !['progress', 'cancelled', 'deleting', 'deleted'].includes(
    server.state.status,
  );
}
