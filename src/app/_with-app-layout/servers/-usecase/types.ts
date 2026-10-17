import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ServerMigrateOwnershipPayload {
  serverId: SchemaCommon.UnitId;
  serverName: string;
  serverTeam?: string;
  /** Casdoor workspace group ID; absent for personal servers. */
  serverTeamId?: string;
}

export type {
  DeleteServerPayload as MachineDeletePayload,
  ReinstallServerPayload as MachineReinstallPayload,
} from '@/features/server-lifecycle-dialogs';
