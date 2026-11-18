import type { ServerCard } from '../rules/schema';

/** How long an agent may stay quiet before the server says so. It reports
 * every 30 seconds by default, so five minutes is many missed reports, not a
 * hiccup. */
export const AGENT_QUIET_AFTER_MS = 5 * 60 * 1000;

/** How often an open page reads the agent's last report again. */
export const AGENT_CHECK_INTERVAL_MS = 60 * 1000;

/** A reading older than this can't say the agent is quiet now: the page was
 * hidden, offline or its refreshes failed. Two missed refreshes. */
export const AGENT_CHECK_FRESH_MS = 2 * AGENT_CHECK_INTERVAL_MS;

const RELEASE_TAG = /^v?\d+\.\d+\.\d+/;

export interface AgentHealth {
  /** Set when a ready server's agent stopped reporting: since when. */
  quietSince?: Date;
  /** Set when a newer agent release exists. */
  upgrade?: {
    current: string;
    next: string;
    /** An old build without a release tag can't upgrade itself; running
     * the server setup again installs the new agent. */
    needsSetup: boolean;
  };
}

type AgentServer = Pick<ServerCard, 'agent' | 'state'>;

/**
 * What the server's agent needs, judged at now.
 *
 * checkedAt is when the page read the server (its last-seen time) from the
 * API. The agent counts as quiet only when that reading is recent and the
 * agent had already been silent for AGENT_QUIET_AFTER_MS at that moment, so
 * an old reading on a page left open never raises a false alarm. Without
 * checkedAt the agent is never called quiet.
 */
export function agentHealth(
  server: AgentServer,
  now: number,
  checkedAt?: number,
): AgentHealth {
  const health: AgentHealth = {};
  const { agent, state } = server;

  if (state.status === 'ready' && agent.lastSeenAt) {
    const lastSeen = new Date(agent.lastSeenAt);
    if (isQuiet(lastSeen.getTime(), now, checkedAt)) {
      health.quietSince = lastSeen;
    }
  }

  // Only a running server's agent can take an upgrade; a deleted, failed or
  // installing one would only add noise.
  if (state.status === 'ready' && agent.upgradeAvailable && agent.newVersion) {
    health.upgrade = {
      current: agent.version,
      next: agent.newVersion,
      needsSetup: !RELEASE_TAG.test(agent.version.trim()),
    };
  }

  return health;
}

function isQuiet(lastSeen: number, now: number, checkedAt?: number) {
  if (Number.isNaN(lastSeen) || checkedAt == null) return false;
  if (now - checkedAt > AGENT_CHECK_FRESH_MS) return false;
  return checkedAt - lastSeen > AGENT_QUIET_AFTER_MS;
}
