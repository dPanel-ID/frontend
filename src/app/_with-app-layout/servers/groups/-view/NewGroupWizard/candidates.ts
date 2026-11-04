import { normalizeArchitecture } from '@/features/server-groups/shared/lib/cluster';
import type { ClusterCandidate } from '@/features/server-groups/shared/lib/cluster';

import type { DTOs } from '@/shared/api';

/** A server list entry as a possible cluster node. */
export function toClusterCandidate(
  machine: DTOs.MachineV1,
): ClusterCandidate | null {
  if (machine.id == null || String(machine.id).trim() === '') return null;
  // Deleted servers stay in the list API for history; they can't join.
  if (machine.status === 'deleted' || machine.status === 'deleting')
    return null;

  const id = String(machine.id);

  return {
    id,
    hostname: machine.hostname?.trim() || id,
    address: machine.address?.trim() || '',
    arch: normalizeArchitecture(machine.os_arch),
    region: machine.region || undefined,
    provider: machine.provider || undefined,
    status: machine.status || undefined,
    hostGroupId: machine.host_group_id || undefined,
  };
}
