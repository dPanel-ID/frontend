import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ReinstallServerPayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
}

export interface DeleteServerPayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
  serverAddress?: string;
  /** Cloud provider ID when dPanel launched the VM; absent for own servers. */
  provider?: string;
}
