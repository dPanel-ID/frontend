import { describe, expect, it } from 'vitest';

import {
  AGENT_CHECK_FRESH_MS,
  AGENT_QUIET_AFTER_MS,
  agentHealth,
} from './agentHealth';

const NOW = Date.parse('2026-11-06T16:50:00Z');

function server(
  status: string,
  agent: Partial<{
    version: string;
    lastSeenAt: string;
    upgradeAvailable: boolean;
    newVersion: string;
  }>,
) {
  return {
    state: { status } as never,
    agent: {
      version: '',
      httpPort: 0,
      upgradeAvailable: false,
      ...agent,
    },
  };
}

describe('agentHealth', () => {
  it('flags a ready server whose agent went quiet on a fresh reading', () => {
    const health = agentHealth(
      server('ready', { lastSeenAt: '2026-11-06T15:13:16Z' }),
      NOW,
      NOW,
    );
    expect(health.quietSince?.toISOString()).toBe('2026-11-06T15:13:16.000Z');
  });

  it('does not flag a recent report', () => {
    expect(
      agentHealth(
        server('ready', { lastSeenAt: '2026-11-06T16:49:30Z' }),
        NOW,
        NOW,
      ).quietSince,
    ).toBeUndefined();
  });

  it('does not flag a server that is not ready or never reported', () => {
    expect(
      agentHealth(
        server('failed', { lastSeenAt: '2026-11-06T10:00:00Z' }),
        NOW,
        NOW,
      ).quietSince,
    ).toBeUndefined();
    expect(
      agentHealth(server('ready', {}), NOW, NOW).quietSince,
    ).toBeUndefined();
  });

  it('never flags without knowing when the reading was taken', () => {
    expect(
      agentHealth(server('ready', { lastSeenAt: '2026-11-06T15:13:16Z' }), NOW)
        .quietSince,
    ).toBeUndefined();
  });

  it('does not flag a page left open on an old reading', () => {
    // Read ten minutes ago, when the agent had reported 30 s before: the
    // clock moved on, the reading did not, so nothing is known to be wrong.
    const checkedAt = NOW - 10 * 60 * 1000;
    const lastSeenAt = new Date(checkedAt - 30 * 1000).toISOString();
    expect(
      agentHealth(server('ready', { lastSeenAt }), NOW, checkedAt).quietSince,
    ).toBeUndefined();
  });

  it('judges quiet at the reading, not at the current time', () => {
    // A fresh reading 40 s old with a report 4.5 min before it: the agent
    // was fine when checked, even though now - lastSeen is past 5 min.
    const checkedAt = NOW - 40 * 1000;
    const lastSeenAt = new Date(checkedAt - 4.5 * 60 * 1000).toISOString();
    expect(
      agentHealth(server('ready', { lastSeenAt }), NOW, checkedAt).quietSince,
    ).toBeUndefined();
  });

  it('flags only within the freshness window', () => {
    const lastSeenAt = new Date(
      NOW - AGENT_QUIET_AFTER_MS - 60 * 1000,
    ).toISOString();
    const quietAt = (checkedAt: number) =>
      agentHealth(server('ready', { lastSeenAt }), checkedAt + 1, checkedAt)
        .quietSince;

    expect(quietAt(NOW)).toBeDefined();
    expect(
      agentHealth(
        server('ready', { lastSeenAt }),
        NOW + AGENT_CHECK_FRESH_MS,
        NOW,
      ).quietSince,
    ).toBeDefined();
    expect(
      agentHealth(
        server('ready', { lastSeenAt }),
        NOW + AGENT_CHECK_FRESH_MS + 1,
        NOW,
      ).quietSince,
    ).toBeUndefined();
  });

  it('ignores an unreadable last-seen time', () => {
    expect(
      agentHealth(server('ready', { lastSeenAt: 'not a date' }), NOW, NOW)
        .quietSince,
    ).toBeUndefined();
  });

  it('offers an upgrade, or setup for an untagged build', () => {
    expect(
      agentHealth(
        server('ready', {
          version: 'v0.1.15',
          upgradeAvailable: true,
          newVersion: 'v0.1.17',
        }),
        NOW,
      ).upgrade,
    ).toEqual({ current: 'v0.1.15', next: 'v0.1.17', needsSetup: false });
    expect(
      agentHealth(
        server('ready', {
          version: 'production',
          upgradeAvailable: true,
          newVersion: 'v0.1.17',
        }),
        NOW,
      ).upgrade?.needsSetup,
    ).toBe(true);
    expect(
      agentHealth(server('ready', { version: 'v0.1.17' }), NOW).upgrade,
    ).toBeUndefined();
    expect(
      agentHealth(
        server('deleted', {
          version: 'production',
          upgradeAvailable: true,
          newVersion: 'v0.1.17',
        }),
        NOW,
      ).upgrade,
    ).toBeUndefined();
  });
});
