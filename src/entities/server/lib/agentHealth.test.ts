import { describe, expect, it } from 'vitest';

import { agentHealth } from './agentHealth';

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
  it('flags a ready server whose agent went quiet', () => {
    const health = agentHealth(
      server('ready', { lastSeenAt: '2026-11-06T15:13:16Z' }),
      NOW,
    );
    expect(health.quietSince?.toISOString()).toBe('2026-11-06T15:13:16.000Z');
  });

  it('does not flag a recent report', () => {
    expect(
      agentHealth(server('ready', { lastSeenAt: '2026-11-06T16:49:30Z' }), NOW)
        .quietSince,
    ).toBeUndefined();
  });

  it('does not flag a server that is not ready or never reported', () => {
    expect(
      agentHealth(server('failed', { lastSeenAt: '2026-11-06T10:00:00Z' }), NOW)
        .quietSince,
    ).toBeUndefined();
    expect(agentHealth(server('ready', {}), NOW).quietSince).toBeUndefined();
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
  });
});
