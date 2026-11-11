import { describe, expect, it } from 'vitest';

import { schemaAgentServerName } from '../-rules/agent-install';

import {
  agentInstallPhase,
  msUntilExpiry,
  toAgentInstallTicket,
} from './agent-install';

describe('agentInstallPhase', () => {
  it.each([
    ['progress', false, 'waiting'],
    ['', false, 'waiting'],
    [undefined, false, 'waiting'],
    ['READY', false, 'ready'],
    ['ready', true, 'ready'],
    ['failed', false, 'failed'],
    ['deleted', true, 'failed'],
    ['progress', true, 'expired'],
  ] as const)('%s (expired %s) is %s', (status, expired, phase) => {
    expect(agentInstallPhase(status, expired)).toBe(phase);
  });
});

describe('toAgentInstallTicket', () => {
  it('maps a numeric server ID, its name and the expiry', () => {
    expect(
      toAgentInstallTicket({
        server: { id: 206, hostname: 'home-server', status: 'progress' },
        command: "curl -fsSL --data 'code=x' https://example.test | sudo bash",
        expires_at: '2026-11-11T12:00:00Z',
      }),
    ).toEqual({
      serverId: '206',
      serverName: 'home-server',
      command: "curl -fsSL --data 'code=x' https://example.test | sudo bash",
      expiresAt: new Date('2026-11-11T12:00:00Z'),
    });
  });

  it('falls back to the ID and drops an unreadable expiry', () => {
    const ticket = toAgentInstallTicket({
      server: { id: '7', hostname: '' },
      command: 'run',
      expires_at: 'soon',
    });
    expect(ticket?.serverName).toBe('7');
    expect(ticket?.expiresAt).toBeNull();
  });

  it('returns null without a server ID or a command', () => {
    expect(toAgentInstallTicket({ command: 'run' })).toBeNull();
    expect(
      toAgentInstallTicket({ server: { id: 1 }, command: ' ' }),
    ).toBeNull();
  });
});

describe('msUntilExpiry', () => {
  it('never goes below zero', () => {
    const at = new Date(10_000);
    expect(msUntilExpiry(at, 4_000)).toBe(6_000);
    expect(msUntilExpiry(at, 20_000)).toBe(0);
    expect(msUntilExpiry(null, 0)).toBeNull();
  });
});

describe('schemaAgentServerName', () => {
  it.each(['', 'home-server', 'Pi4', 'a1'])('accepts %j', (value) => {
    expect(schemaAgentServerName.safeParse(value).success).toBe(true);
  });

  it.each(['-a', 'a-', 'a', '1abc', 'my_server', 'a.b', 'x'.repeat(64)])(
    'rejects %j',
    (value) => {
      expect(schemaAgentServerName.safeParse(value).success).toBe(false);
    },
  );

  it('normalizes case and spaces', () => {
    expect(schemaAgentServerName.parse('  Home-Server ')).toBe('home-server');
  });
});
