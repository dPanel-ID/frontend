import type { DTOs } from '@/shared/api';

/** Where a server added with the install command stands. */
export type AgentInstallPhase = 'waiting' | 'ready' | 'failed' | 'expired';

const FAILED_STATUSES = ['failed', 'error', 'cancelled', 'deleting', 'deleted'];

/**
 * The phase of a freshly added server: `progress` (and any status the API
 * has not set yet, including '') means its agent has not connected; `ready`
 * means it has. Once the command's code has expired a server still waiting
 * can no longer connect with it.
 */
export function agentInstallPhase(
  status: string | null | undefined,
  expired: boolean,
): AgentInstallPhase {
  const normalized = (status ?? '').trim().toLowerCase();

  if (normalized === 'ready') return 'ready';
  if (FAILED_STATUSES.includes(normalized)) return 'failed';
  return expired ? 'expired' : 'waiting';
}

/** The install command as the card shows it. */
export interface AgentInstallTicket {
  serverId: string;
  serverName: string;
  command: string;
  /** When the single-use code stops working; null when the API gave none. */
  expiresAt: Date | null;
}

/**
 * Maps the agent-install response to what the card needs. Returns null when
 * the response lacks the server ID or the command, which leaves nothing to
 * show or follow.
 */
export function toAgentInstallTicket(dto: {
  server?: DTOs.MachineV1;
  command?: string;
  expires_at?: string;
}): AgentInstallTicket | null {
  const serverId =
    dto.server?.id == null || dto.server.id === '' ? '' : String(dto.server.id);
  const command = dto.command?.trim() ?? '';
  if (!serverId || !command) return null;

  const expiresAt = dto.expires_at ? new Date(dto.expires_at) : null;

  return {
    serverId,
    serverName: dto.server?.hostname?.trim() || serverId,
    command,
    expiresAt:
      expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
}

/** Milliseconds until the code expires; null when it never does here. */
export function msUntilExpiry(expiresAt: Date | null, now: number) {
  if (!expiresAt) return null;
  return Math.max(0, expiresAt.getTime() - now);
}
