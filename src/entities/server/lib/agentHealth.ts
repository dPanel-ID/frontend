import type { ServerCard } from '../rules/schema';

/** How long an agent may stay quiet before the server says so. It reports
 * every 15 seconds, so five minutes is many missed reports, not a hiccup. */
export const AGENT_QUIET_AFTER_MS = 5 * 60 * 1000;

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

/** What the server's agent needs, judged at now. */
export function agentHealth(server: AgentServer, now: number): AgentHealth {
  const health: AgentHealth = {};
  const { agent, state } = server;

  if (state.status === 'ready' && agent.lastSeenAt) {
    const lastSeen = new Date(agent.lastSeenAt);
    if (
      !Number.isNaN(lastSeen.getTime()) &&
      now - lastSeen.getTime() > AGENT_QUIET_AFTER_MS
    ) {
      health.quietSince = lastSeen;
    }
  }

  if (agent.upgradeAvailable && agent.newVersion) {
    health.upgrade = {
      current: agent.version,
      next: agent.newVersion,
      needsSetup: !RELEASE_TAG.test(agent.version.trim()),
    };
  }

  return health;
}
