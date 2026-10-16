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
}

export interface MachineDeletePayload {
  serverName?: string;
  serverId: SchemaCommon.UnitId;
}
