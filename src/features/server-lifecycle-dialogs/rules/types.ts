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

/**
 * The server is gone and still holds resources: it can only be removed from
 * dPanel, with them (backend docs/features/server-removal.md).
 */
export interface ForgetServerOffer {
  deployments: number;
  artifacts: number;
  loadBalancers: number;
  /** When its agent last reported, if ever (ISO time). */
  lastSeenAt?: string;
  reason?: string;
  /**
   * Set for a cloud server whose provider dPanel cannot ask: the owner must
   * confirm they deleted the VM there. Forget never deletes a VM.
   */
  unverifiedCloudProvider?: string;
}
