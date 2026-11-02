import { describe, expect, it } from 'vitest';

import {
  applyRequest,
  applyStatusTone,
  applyTurnsFirewallOn,
  formatFirewallTime,
  isAnySource,
  isAwaitingApply,
  toFirewallPlanView,
  toFirewallView,
} from './firewall';

const firewall = {
  server_id: '113',
  module_installed: true,
  policy: {
    enabled: true,
    default_incoming: 'deny',
    default_outgoing: 'allow',
    default_routed: 'deny',
    docker_filtering: true,
    version: 5,
    applied_version: 4,
    applied_at: '2026-11-02T10:00:00Z',
    last_execution_id: 'exec_1',
    drift: true,
    apply_in_progress: false,
    last_apply_status: 'Succeeded',
  },
  rules: [
    {
      id: 'sys-ssh',
      action: 'allow',
      direction: 'in',
      protocol: 'tcp',
      port: '22',
      source: '',
      origin: 'system',
      locked: true,
    },
    {
      id: 'r1',
      action: 'allow',
      direction: 'route',
      protocol: 'tcp',
      port: '4150',
      source: '82.153.226.242',
      comment: 'legacy nsqd',
      origin: 'user',
      locked: false,
    },
  ],
};

describe('toFirewallView', () => {
  it('maps the policy, rule targets and pending changes', () => {
    const view = toFirewallView(firewall);

    expect(view.serverId).toBe('113');
    expect(view.moduleInstalled).toBe(true);
    expect(view.policy).toMatchObject({
      enabled: true,
      dockerFiltering: true,
      version: 5,
      appliedVersion: 4,
      drift: true,
      lastApplyStatus: 'succeeded',
      neverApplied: false,
      pendingChanges: true,
    });
    expect(view.rules.map((rule) => [rule.target, rule.locked])).toEqual([
      ['host', true],
      ['docker', false],
    ]);
    expect(view.rules[1]).toMatchObject({
      source: '82.153.226.242',
      comment: 'legacy nsqd',
      origin: 'user',
    });
  });

  it('survives an empty, null-filled payload', () => {
    const view = toFirewallView({ policy: null, rules: null });

    expect(view.moduleInstalled).toBe(false);
    expect(view.rules).toEqual([]);
    expect(view.policy).toMatchObject({
      enabled: false,
      defaultIncoming: 'deny',
      version: 0,
      neverApplied: true,
      pendingChanges: false,
    });
  });

  it('locks system rules and rules without an ID, and tolerates unknown origins', () => {
    const view = toFirewallView({
      rules: [
        { id: 's', origin: 'system', locked: false, source: 'any' },
        { origin: 'user' },
        { id: 'x', origin: 'something-new' },
      ],
    });

    expect(view.rules.map((rule) => rule.locked)).toEqual([true, true, false]);
    expect(view.rules[0]?.source).toBe('');
    expect(view.rules[1]?.id).toBe('rule-1');
    expect(view.rules[2]?.origin).toBe('other');
  });

  it('does not report pending changes while an apply runs', () => {
    const view = toFirewallView({
      policy: { version: 3, applied_version: 2, apply_in_progress: true },
    });
    expect(view.policy.pendingChanges).toBe(false);
    expect(view.policy.applyInProgress).toBe(true);
  });

  it('rejects a payload that is not the firewall shape', () => {
    expect(() => toFirewallView({ rules: 'nope' })).toThrow();
  });
});

describe('toFirewallPlanView', () => {
  it('maps the diff and keeps the reason when the live firewall is unavailable', () => {
    const plan = toFirewallPlanView({
      firewall,
      live: { available: false, reason: 'firewall module not installed' },
      to_add: [firewall.rules[1]],
      to_remove: [{ raw: 'allow 9100/tcp', dpanel_id: 'old' }],
      foreign: [
        {
          raw: '',
          action: 'allow',
          port: '8080',
          proto: 'tcp',
          from: '10.0.0.0/8',
        },
      ],
      enabled_change: 'enable',
      default_changes: [
        { direction: 'incoming', live: 'allow', desired: 'deny' },
      ],
      docker_change: 'hook',
      ssh_open: true,
      in_sync: false,
    });

    expect(plan.live).toEqual({
      available: false,
      reason: 'firewall module not installed',
      enabled: false,
    });
    expect(plan.toAdd).toHaveLength(1);
    expect(plan.toRemove).toEqual([
      { text: 'allow 9100/tcp', dpanelId: 'old' },
    ]);
    expect(plan.foreign[0]?.text).toBe('allow 8080 tcp from 10.0.0.0/8');
    expect(plan.enabledChange).toBe('enable');
    expect(plan.dockerChange).toBe('hook');
    expect(plan.defaultChanges).toEqual([
      { direction: 'incoming', live: 'allow', desired: 'deny' },
    ]);
    expect(plan.sshOpen).toBe(true);
  });

  it('normalises unknown change values and missing lists', () => {
    const plan = toFirewallPlanView({
      enabled_change: 'maybe',
      docker_change: null,
    });
    expect(plan.enabledChange).toBe('');
    expect(plan.dockerChange).toBe('');
    expect(plan.foreign).toEqual([]);
    expect(plan.sshOpen).toBe(false);
  });
});

describe('apply helpers', () => {
  it('asks to confirm when the apply turns the firewall on', () => {
    expect(applyTurnsFirewallOn({ enabled: false })).toBe(true);
    expect(
      applyTurnsFirewallOn({ enabled: true }, { enabledChange: 'enable' }),
    ).toBe(true);
    expect(applyTurnsFirewallOn({ enabled: true }, { enabledChange: '' })).toBe(
      false,
    );
  });

  it('enables only a disabled policy and sends the reviewed version', () => {
    expect(applyRequest({ enabled: false, version: 7 })).toEqual({
      version: 7,
      enable: true,
    });
    expect(applyRequest({ enabled: true, version: 7 })).toEqual({
      version: 7,
      enable: false,
    });
  });

  it('keeps waiting until the queued execution is reported and finished', () => {
    expect(isAwaitingApply({ applyInProgress: true }, null)).toBe(true);
    expect(
      isAwaitingApply({ applyInProgress: false, lastExecutionId: 'a' }, 'b'),
    ).toBe(true);
    expect(
      isAwaitingApply({ applyInProgress: false, lastExecutionId: 'b' }, 'b'),
    ).toBe(false);
    expect(isAwaitingApply({ applyInProgress: false }, null)).toBe(false);
  });

  it('colors apply results and recognises any-source values', () => {
    expect(applyStatusTone('succeeded')).toBe('success');
    expect(applyStatusTone('FAILED')).toBe('danger');
    expect(applyStatusTone('running')).toBe('info');
    expect(applyStatusTone('')).toBe('neutral');
    expect(isAnySource('0.0.0.0/0')).toBe(true);
    expect(isAnySource(' Any ')).toBe(true);
    expect(isAnySource('10.0.0.1')).toBe(false);
  });
});

describe('formatFirewallTime', () => {
  it('passes through empty and unparseable values', () => {
    expect(formatFirewallTime(undefined)).toBe('');
    expect(formatFirewallTime('not a date')).toBe('not a date');
    expect(formatFirewallTime('2026-11-02T10:00:00Z')).not.toBe('');
  });
});
