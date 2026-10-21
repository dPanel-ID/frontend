import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { AGENT_STALE_AFTER_MS } from './activity';
import {
  buildVerdict,
  inFlightServers,
  resourceLifecycle,
  summaryAttentionCount,
  summaryInFlightCount,
  unhealthyServers,
} from './verdict';

const NOW = Date.parse('2026-10-21T12:00:00Z');

function server(status?: string, id = 'm_1'): DTOs.MachineV1 {
  return { id, hostname: `host-${id}`, status } as DTOs.MachineV1;
}

function agent(lastSeenAt?: string): DTOs.AgentV2 {
  return { id: 'agent_1', machine_id: 'm_1', last_seen_at: lastSeenAt };
}

function freshAgent(): DTOs.AgentV2 {
  return agent(new Date(NOW - 60_000).toISOString());
}

describe('resourceLifecycle', () => {
  it.each([
    ['ready', 'succeeded'],
    ['failed', 'failed'],
    ['cancelled', 'cancelled'],
    ['progress', 'running'],
    ['deleting', 'running'],
    ['  PROGRESS  ', 'running'],
  ])(
    'maps the resource status %s onto the shared lifecycle',
    (status, expected) => {
      expect(resourceLifecycle(status)).toBe(expected);
    },
  );

  it.each([undefined, '', '   ', 'legacy_status'])(
    'collapses %s to unknown rather than guessing',
    (status) => {
      expect(resourceLifecycle(status)).toBe('unknown');
    },
  );
});

describe('server classification', () => {
  const servers = [
    server('ready', 'm_1'),
    server('failed', 'm_2'),
    server('cancelled', 'm_3'),
    server('progress', 'm_4'),
    server('', 'm_5'),
  ];

  it('counts only failed and cancelled machines as needing attention', () => {
    expect(unhealthyServers(servers).map((item) => item.id)).toEqual([
      'm_2',
      'm_3',
    ]);
  });

  it('counts provisioning machines as in flight', () => {
    expect(inFlightServers(servers).map((item) => item.id)).toEqual(['m_4']);
  });

  it('never reports an empty or legacy status as a problem', () => {
    expect(unhealthyServers([server('', 'm_5')])).toHaveLength(0);
    expect(unhealthyServers([server('legacy', 'm_6')])).toHaveLength(0);
  });
});

describe('summary counts', () => {
  it('adds failed and cancelled executions together', () => {
    expect(summaryAttentionCount({ failed: 2, cancelled: 1 })).toBe(3);
  });

  it('adds pending, queued and running executions together', () => {
    expect(summaryInFlightCount({ pending: 1, queued: 2, running: 3 })).toBe(6);
  });

  it.each([
    [undefined, 0],
    [{}, 0],
  ])('treats %s as nothing reported', (summary, expected) => {
    expect(summaryAttentionCount(summary)).toBe(expected);
    expect(summaryInFlightCount(summary)).toBe(expected);
  });
});

describe('buildVerdict', () => {
  it('reports healthy when every source is readable and quiet', () => {
    const verdict = buildVerdict({
      summary: { total: 12, succeeded: 12 },
      servers: [server('ready')],
      agents: [freshAgent()],
      now: NOW,
    });

    expect(verdict.level).toBe('healthy');
    expect(verdict.attentionCount).toBe(0);
    expect(verdict.degraded).toBe(false);
  });

  it('reports healthy for a workspace with no resources at all', () => {
    const verdict = buildVerdict({
      summary: {},
      servers: [],
      agents: [],
      now: NOW,
    });

    expect(verdict.level).toBe('healthy');
  });

  it('counts failures across executions, machines and agents', () => {
    const verdict = buildVerdict({
      summary: { failed: 2, cancelled: 1 },
      servers: [server('failed', 'm_1'), server('ready', 'm_2')],
      agents: [
        agent(new Date(NOW - AGENT_STALE_AFTER_MS - 1000).toISOString()),
      ],
      now: NOW,
    });

    expect(verdict.level).toBe('attention');
    expect(verdict.failedExecutions).toBe(3);
    expect(verdict.unhealthyServers).toBe(1);
    expect(verdict.unreachableAgents).toBe(1);
    expect(verdict.attentionCount).toBe(5);
  });

  it('prefers attention over in-flight work when both are present', () => {
    const verdict = buildVerdict({
      summary: { failed: 1, running: 4 },
      servers: [server('progress')],
      agents: [freshAgent()],
      now: NOW,
    });

    expect(verdict.level).toBe('attention');
    expect(verdict.inFlight).toBe(5);
  });

  it('reports working when the only news is unfinished work', () => {
    const verdict = buildVerdict({
      summary: { running: 1, queued: 1 },
      servers: [server('ready')],
      agents: [freshAgent()],
      now: NOW,
    });

    expect(verdict.level).toBe('working');
    expect(verdict.inFlight).toBe(2);
  });

  it('counts a provisioning machine as in flight without an execution', () => {
    const verdict = buildVerdict({
      summary: {},
      servers: [server('deleting')],
      agents: [freshAgent()],
      now: NOW,
    });

    expect(verdict.level).toBe('working');
    expect(verdict.inFlight).toBe(1);
  });

  it('treats an agent that has never reported as out of contact', () => {
    const verdict = buildVerdict({
      summary: {},
      servers: [server('ready')],
      agents: [agent(undefined)],
      now: NOW,
    });

    expect(verdict.unreachableAgents).toBe(1);
    expect(verdict.level).toBe('attention');
  });

  it('marks the verdict degraded when a source is unreadable', () => {
    const verdict = buildVerdict({
      summary: undefined,
      servers: [server('ready')],
      agents: [freshAgent()],
      now: NOW,
    });

    expect(verdict.degraded).toBe(true);
    expect(verdict.level).toBe('healthy');
  });

  it('still reports the failures it can see while degraded', () => {
    const verdict = buildVerdict({
      summary: undefined,
      servers: [server('failed')],
      agents: undefined,
      now: NOW,
    });

    expect(verdict.level).toBe('attention');
    expect(verdict.attentionCount).toBe(1);
    expect(verdict.degraded).toBe(true);
  });

  it('claims nothing when no source could be read', () => {
    const verdict = buildVerdict({
      summary: undefined,
      servers: [],
      agents: undefined,
      serversUnavailable: true,
      now: NOW,
    });

    expect(verdict.level).toBe('unknown');
    expect(verdict.attentionCount).toBe(0);
    expect(verdict.degraded).toBe(true);
  });

  it('ignores a stale server list rather than counting it as healthy', () => {
    const verdict = buildVerdict({
      summary: { succeeded: 1 },
      servers: [server('failed')],
      agents: [freshAgent()],
      serversUnavailable: true,
      now: NOW,
    });

    expect(verdict.unhealthyServers).toBe(0);
    expect(verdict.level).toBe('healthy');
    expect(verdict.degraded).toBe(true);
  });
});
