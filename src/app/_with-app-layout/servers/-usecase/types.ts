import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ServerMigrateOwnershipPayload {
  serverId: SchemaCommon.UnitId;
  serverName: string;
  serverTeam?: string;
  /** Casdoor workspace group ID; absent for personal servers. */
  serverTeamId?: string;
}

export interface MachineReinstallPayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
}

export interface MachineDeletePayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
  serverAddress?: string;
  /** Cloud provider ID when dPanel launched the VM; absent for own servers. */
  provider?: string;
}
