import type { DTOs } from '@/shared/api';
import type { Dto as AgentInstallStatusDto } from '@/shared/api/server.agent-install-status.$id';

/**
 * Where a server added with the install command stands: `waiting` until the
 * command runs on a machine, `started` once it did, then `ready`, `failed`
 * or, when the code ran out first, `expired`.
 */
export type AgentInstallPhase =
  | 'waiting'
  | 'started'
  | 'ready'
  | 'failed'
  | 'expired';

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

/** What the card shows about a running install. */
export interface AgentInstallProgress {
  phase: AgentInstallPhase;
  /** Stable reason the install stopped (for example no_systemd), or ''. */
  reason: string;
  /** The server's error, which says what happened and what to do. */
  error: string;
}

/**
 * The progress of an install from the install-status endpoint. A connected
 * agent wins over everything; a reported reason or a failed server is a
 * failure; a fetched script means the command started on the machine.
 */
export function agentInstallProgress(
  dto: AgentInstallStatusDto | undefined,
  expired: boolean,
): AgentInstallProgress {
  const reason = dto?.install_reason?.trim() ?? '';
  const error = dto?.error?.trim() ?? '';
  if (dto?.connected) return { phase: 'ready', reason: '', error: '' };

  const phase = agentInstallPhase(dto?.status, false);
  if (phase === 'ready') return { phase, reason: '', error: '' };
  if (phase === 'failed' || reason) {
    return { phase: 'failed', reason, error };
  }
  if (expired) return { phase: 'expired', reason: '', error: '' };
  return {
    phase: dto?.script_downloaded_at ? 'started' : 'waiting',
    reason: '',
    error: '',
  };
}

/** The install command as the card shows it. */
export interface AgentInstallTicket {
  serverId: string;
  serverName: string;
  command: string;
  /** The command for a root shell (no sudo); '' when the API gave none. */
  rootCommand: string;
  /** The command with wget instead of curl; '' when the API gave none. */
  wgetCommand: string;
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
  root_command?: string;
  wget_command?: string;
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
    rootCommand: dto.root_command?.trim() ?? '',
    wgetCommand: dto.wget_command?.trim() ?? '',
    expiresAt:
      expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
  };
}

/** Milliseconds until the code expires; null when it never does here. */
export function msUntilExpiry(expiresAt: Date | null, now: number) {
  if (!expiresAt) return null;
  return Math.max(0, expiresAt.getTime() - now);
}
