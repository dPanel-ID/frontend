import { describe, expect, it } from 'vitest';

import { schemaAgentServerName } from '../-rules/agent-install';

import {
  agentInstallPhase,
  agentInstallProgress,
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

describe('agentInstallProgress', () => {
  it('waits until the command runs, then shows it started', () => {
    expect(agentInstallProgress({ status: 'progress' }, false).phase).toBe(
      'waiting',
    );
    expect(
      agentInstallProgress(
        { status: 'progress', script_downloaded_at: '2026-11-28T10:00:00Z' },
        false,
      ).phase,
    ).toBe('started');
  });

  it('reports a stopped install with its reason and error', () => {
    expect(
      agentInstallProgress(
        {
          status: 'failed',
          error: 'The install ran on the machine but stopped',
          install_reason: 'no_systemd',
        },
        false,
      ),
    ).toEqual({
      phase: 'failed',
      reason: 'no_systemd',
      error: 'The install ran on the machine but stopped',
    });
  });

  it('is ready once the agent connected, even after a reported stop', () => {
    expect(
      agentInstallProgress(
        { status: 'failed', connected: true, install_reason: 'not_connected' },
        true,
      ).phase,
    ).toBe('ready');
  });

  it('expires only a server that is still waiting', () => {
    expect(agentInstallProgress({ status: 'progress' }, true).phase).toBe(
      'expired',
    );
    expect(agentInstallProgress(undefined, false).phase).toBe('waiting');
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
      rootCommand: '',
      wgetCommand: '',
      expiresAt: new Date('2026-11-11T12:00:00Z'),
    });
  });

  it('keeps the root and wget variants', () => {
    const ticket = toAgentInstallTicket({
      server: { id: 9 },
      command: 'curl x | sudo bash',
      root_command: 'curl x | bash',
      wget_command: 'wget x | bash',
    });
    expect(ticket?.rootCommand).toBe('curl x | bash');
    expect(ticket?.wgetCommand).toBe('wget x | bash');
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
