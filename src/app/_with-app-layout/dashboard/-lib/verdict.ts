import type { DTOs } from '@/shared/api';

import {
  executionLifecycle,
  isInFlightLifecycle,
  needsAttentionLifecycle,
  staleAgents,
} from './activity';
import type { ExecutionLifecycle } from './activity';

/**
 * The single claim the page opens with. 'unknown' is reserved for the case
 * where no source could be read at all: claiming health we cannot verify is
 * worse than admitting we cannot tell.
 */
export type VerdictLevel = 'attention' | 'working' | 'healthy' | 'unknown';

export interface VerdictSources {
  /** Execution counts for the verdict window, or undefined when unreadable. */
  summary?: DTOs.ExecutionSummaryV2;
  servers: DTOs.MachineV1[];
  /** Agent registrations, or undefined when unreadable. */
  agents?: DTOs.AgentV2[];
  /** True when the server list itself could not be read. */
  serversUnavailable?: boolean;
  now?: number;
}

export interface Verdict {
  level: VerdictLevel;
  /** Everything a person is expected to act on, across all three sources. */
  attentionCount: number;
  unhealthyServers: number;
  failedExecutions: number;
  unreachableAgents: number;
  inFlight: number;
  /** A source could not be read, so the counts may be incomplete. */
  degraded: boolean;
}

/**
 * Machines and installers report their own status vocabulary ('ready',
 * 'progress', 'deleting'); map it onto the shared execution lifecycle so
 * attention and in-flight are decided in exactly one place for every resource
 * the dashboard reports on.
 */
export function resourceLifecycle(status?: string): ExecutionLifecycle {
  switch (
    String(status ?? '')
      .trim()
      .toLowerCase()
  ) {
    case 'ready':
      return 'succeeded';
    case 'progress':
    case 'deleting':
      return 'running';
    default:
      return executionLifecycle(status);
  }
}

/** Machines a person is expected to act on. */
export function unhealthyServers(servers: DTOs.MachineV1[]) {
  return servers.filter((server) =>
    needsAttentionLifecycle(resourceLifecycle(server.status)),
  );
}

/** Machines the platform is still working on. */
export function inFlightServers(servers: DTOs.MachineV1[]) {
  return servers.filter((server) =>
    isInFlightLifecycle(resourceLifecycle(server.status)),
  );
}

/** Executions in the summary window that ended badly. */
export function summaryAttentionCount(summary?: DTOs.ExecutionSummaryV2) {
  if (!summary) return 0;
  return (summary.failed ?? 0) + (summary.cancelled ?? 0);
}

/** Executions in the summary window that have not finished. */
export function summaryInFlightCount(summary?: DTOs.ExecutionSummaryV2) {
  if (!summary) return 0;
  return (
    (summary.pending ?? 0) + (summary.queued ?? 0) + (summary.running ?? 0)
  );
}

/**
 * Combines execution counts, machine status and agent heartbeats into the one
 * sentence the dashboard opens with.
 */
export function buildVerdict(sources: VerdictSources): Verdict {
  const {
    agents,
    now = Date.now(),
    servers,
    serversUnavailable = false,
    summary,
  } = sources;

  const unhealthy = serversUnavailable ? 0 : unhealthyServers(servers).length;
  const working = serversUnavailable ? 0 : inFlightServers(servers).length;
  const failedExecutions = summaryAttentionCount(summary);
  const unreachableAgents = agents ? staleAgents(agents, now).length : 0;
  const inFlight = summaryInFlightCount(summary) + working;
  const attentionCount = unhealthy + failedExecutions + unreachableAgents;

  const degraded =
    summary === undefined || agents === undefined || serversUnavailable;
  const hasAnySource =
    summary !== undefined || agents !== undefined || !serversUnavailable;

  const level: VerdictLevel = attentionCount
    ? 'attention'
    : inFlight
      ? 'working'
      : hasAnySource
        ? 'healthy'
        : 'unknown';

  return {
    level,
    attentionCount,
    unhealthyServers: unhealthy,
    failedExecutions,
    unreachableAgents,
    inFlight,
    degraded,
  };
}
