import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ReinstallServerPayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
  /** A private server's setup reinstalls only its agent. */
  isPrivate?: boolean;
}

export interface DeleteServerPayload {
  serverId: SchemaCommon.UnitId;
  serverName?: string;
  serverAddress?: string;
  /** Cloud provider ID when dPanel launched the VM; absent for own servers. */
  provider?: string;
}
