import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  AGENT_STALE_AFTER_MS,
  executionDurationMs,
  executionFailureSummary,
  executionLifecycle,
  executionTarget,
  executionTypeKey,
  humanizeIdentifier,
  redactSecrets,
  sortActivityItems,
  staleAgents,
  toActivityItem,
} from './activity';

function execution(
  overrides: Partial<DTOs.ExecutionV2> = {},
): DTOs.ExecutionV2 {
  return { id: 'exec_1', ...overrides };
}

describe('executionLifecycle', () => {
  it.each([
    ['succeeded', 'succeeded'],
    ['failed', 'failed'],
    ['running', 'running'],
    ['  FAILED  ', 'failed'],
  ])('classifies %s', (status, expected) => {
    expect(executionLifecycle(status)).toBe(expected);
  });

  it.each([undefined, '', '   ', 'something_legacy'])(
    'collapses %s to unknown rather than leaking it',
    (status) => {
      expect(executionLifecycle(status)).toBe('unknown');
    },
  );
});

describe('executionTypeKey', () => {
  it('maps known types', () => {
    expect(executionTypeKey('machine_setup')).toBe('machineSetup');
    expect(executionTypeKey('iac_module_install')).toBe('moduleInstall');
    expect(executionTypeKey('module.install')).toBe('moduleInstall');
  });

  it('returns undefined for unknown types so the caller can fall back', () => {
    expect(executionTypeKey('brand_new_type')).toBeUndefined();
    expect(executionTypeKey('')).toBeUndefined();
    expect(executionTypeKey(undefined)).toBeUndefined();
  });
});

describe('humanizeIdentifier', () => {
  it('renders an unknown identifier readably', () => {
    expect(humanizeIdentifier('iac_custom_playbook')).toBe(
      'Iac custom playbook',
    );
    expect(humanizeIdentifier('module.install')).toBe('Module install');
  });

  it('is empty for missing input', () => {
    expect(humanizeIdentifier(undefined)).toBe('');
    expect(humanizeIdentifier('  ')).toBe('');
  });
});

describe('redactSecrets', () => {
  it('redacts secret assignments but keeps the surrounding message', () => {
    expect(redactSecrets('failed: password=hunter2 while connecting')).toBe(
      'failed: password=[redacted] while connecting',
    );
    expect(redactSecrets('api_key: abc123')).toBe('api_key: [redacted]');
  });

  it('leaves ordinary text untouched', () => {
    expect(redactSecrets('ansible task failed on host web-01')).toBe(
      'ansible task failed on host web-01',
    );
  });
});

describe('executionFailureSummary', () => {
  it('prefers the first error, which names the cause', () => {
    expect(
      executionFailureSummary(
        execution({
          first_error_message: 'apt lock held',
          error: 'playbook failed',
          last_event_message: 'task failed',
        }),
      ),
    ).toBe('apt lock held');
  });

  it('falls back through error then last event', () => {
    expect(
      executionFailureSummary(execution({ error: 'playbook failed' })),
    ).toBe('playbook failed');
    expect(
      executionFailureSummary(execution({ last_event_message: 'task failed' })),
    ).toBe('task failed');
  });

  it('is undefined when nothing is reported', () => {
    expect(executionFailureSummary(execution())).toBeUndefined();
    expect(
      executionFailureSummary(execution({ error: '   ' })),
    ).toBeUndefined();
  });

  it('redacts secrets in the summary it returns', () => {
    expect(
      executionFailureSummary(execution({ error: 'auth failed token=abc' })),
    ).toBe('auth failed token=[redacted]');
  });
});

describe('executionDurationMs', () => {
  it('measures start to finish', () => {
    expect(
      executionDurationMs(
        execution({
          started_at: '2026-10-21T10:00:00Z',
          finished_at: '2026-10-21T10:02:30Z',
        }),
      ),
    ).toBe(150_000);
  });

  it('is undefined while still running', () => {
    expect(
      executionDurationMs(execution({ started_at: '2026-10-21T10:00:00Z' })),
    ).toBeUndefined();
  });

  it('ignores a finish before its start rather than reporting negative time', () => {
    expect(
      executionDurationMs(
        execution({
          started_at: '2026-10-21T10:05:00Z',
          finished_at: '2026-10-21T10:00:00Z',
        }),
      ),
    ).toBeUndefined();
  });

  it('is undefined for unparseable timestamps', () => {
    expect(
      executionDurationMs(
        execution({ started_at: 'not-a-date', finished_at: 'also-not' }),
      ),
    ).toBeUndefined();
  });
});

describe('executionTarget', () => {
  it('prefers the hostname and falls back to the address', () => {
    expect(
      executionTarget(
        execution({ machine_hostname: 'web-01', machine_address: '10.0.0.1' }),
      ),
    ).toBe('web-01');
    expect(executionTarget(execution({ machine_address: '10.0.0.1' }))).toBe(
      '10.0.0.1',
    );
  });

  it('is undefined when the machine could not be resolved', () => {
    expect(executionTarget(execution({ machine_id: '42' }))).toBeUndefined();
  });
});

describe('toActivityItem', () => {
  it('projects an execution into a renderable item', () => {
    const item = toActivityItem(
      execution({
        type: 'machine_setup',
        status: 'failed',
        actor_subject: 'nedya',
        machine_hostname: 'web-01',
        machine_id: '7',
        created_at: '2026-10-21T10:00:00Z',
        finished_at: '2026-10-21T10:01:00Z',
        first_error_message: 'apt lock held',
        error_count: 2,
      }),
    );

    expect(item).toMatchObject({
      id: 'exec_1',
      lifecycle: 'failed',
      typeKey: 'machineSetup',
      target: 'web-01',
      actor: 'nedya',
      needsAttention: true,
      inFlight: false,
      errorCount: 2,
      failureSummary: 'apt lock held',
    });
    expect(item.durationMs).toBe(60_000);
  });

  it('survives a legacy row with empty strings and no machine', () => {
    const item = toActivityItem(
      execution({ id: '', status: '', type: '', created_at: '' }),
    );

    expect(item.lifecycle).toBe('unknown');
    expect(item.needsAttention).toBe(false);
    expect(item.inFlight).toBe(false);
    expect(item.target).toBeUndefined();
    expect(item.typeKey).toBeUndefined();
    expect(item.typeFallback).toBe('');
    expect(item.sortTime).toBe(0);
  });

  it('treats in-flight statuses as in flight and not as attention', () => {
    for (const status of ['pending', 'queued', 'running']) {
      const item = toActivityItem(execution({ status }));
      expect(item.inFlight).toBe(true);
      expect(item.needsAttention).toBe(false);
    }
  });
});

describe('sortActivityItems', () => {
  it('orders newest first and does not mutate its input', () => {
    const items = [
      toActivityItem(
        execution({ id: 'old', created_at: '2026-10-20T10:00:00Z' }),
      ),
      toActivityItem(
        execution({ id: 'new', created_at: '2026-10-21T10:00:00Z' }),
      ),
    ];

    expect(sortActivityItems(items).map((item) => item.id)).toEqual([
      'new',
      'old',
    ]);
    expect(items.map((item) => item.id)).toEqual(['old', 'new']);
  });
});

describe('staleAgents', () => {
  const now = Date.parse('2026-10-21T10:00:00Z');

  it('flags agents quiet for longer than the tolerance', () => {
    const agents: DTOs.AgentV2[] = [
      { machine_id: '1', last_seen_at: '2026-10-21T09:59:00Z' },
      { machine_id: '2', last_seen_at: '2026-10-21T09:00:00Z' },
    ];

    expect(staleAgents(agents, now).map((agent) => agent.machine_id)).toEqual([
      '2',
    ]);
  });

  it('treats an agent that never reported as out of contact', () => {
    expect(staleAgents([{ machine_id: '3' }], now)).toHaveLength(1);
    expect(
      staleAgents([{ machine_id: '4', last_seen_at: '' }], now),
    ).toHaveLength(1);
  });

  it('keeps an agent exactly at the tolerance boundary', () => {
    const agents: DTOs.AgentV2[] = [
      {
        machine_id: '5',
        last_seen_at: new Date(now - AGENT_STALE_AFTER_MS).toISOString(),
      },
    ];

    expect(staleAgents(agents, now)).toHaveLength(0);
  });
});

describe('executionTypeKey for agent-reported machine types', () => {
  it('maps the agent create and delete types rather than humanising them', () => {
    // Seen in production as "Machine machine create on db-manager".
    expect(executionTypeKey('machine_machine.create')).toBe('machineCreate');
    expect(executionTypeKey('machine_machine.delete')).toBe('machineDelete');
  });
});
