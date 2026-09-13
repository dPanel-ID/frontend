import type { DTOs } from '@/shared/api';

export interface SelectableMachine {
  id: string;
  hostname: string;
  address: string;
  currentHostGroupId?: string;
}

export function toSelectableMachine(
  machine: DTOs.MachineV1,
): SelectableMachine | null {
  const rawId = machine.id;

  if (rawId == null || String(rawId).trim() === '') {
    return null;
  }

  const id = String(rawId);

  return {
    id,
    hostname: machine.hostname?.trim() || id,
    address: machine.address?.trim() || 'No public address',
    currentHostGroupId: machine.host_group_id || undefined,
  };
}
