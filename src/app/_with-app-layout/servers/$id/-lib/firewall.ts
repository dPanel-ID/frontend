import {
  schemaFirewallPlanV2,
  schemaFirewallV2,
} from '@/shared/api/-dtos/firewall';
import type {
  FirewallLiveRuleV2,
  FirewallRuleV2,
} from '@/shared/api/-dtos/firewall';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

export const FIREWALL_ORIGINS = ['system', 'legacy', 'user', 'module'] as const;

/** Who put a rule there; anything the API adds later reads as `other`. */
export type FirewallOrigin = (typeof FIREWALL_ORIGINS)[number] | 'other';

export interface FirewallRuleItem {
  id: string;
  action: string;
  /** `route` targets a Docker-published container port. */
  target: 'host' | 'docker';
  protocol: string;
  /** Empty means any port. */
  port: string;
  /** Empty means anywhere. */
  source: string;
  comment: string;
  origin: FirewallOrigin;
  locked: boolean;
}

export interface FirewallPolicyView {
  enabled: boolean;
  defaultIncoming: string;
  defaultOutgoing: string;
  defaultRouted: string;
  dockerFiltering: boolean;
  version: number;
  appliedVersion: number;
  appliedAt?: string;
  lastExecutionId?: string;
  liveCheckedAt?: string;
  drift: boolean;
  applyInProgress: boolean;
  lastApplyStatus: string;
  /** Nothing was ever applied to this server. */
  neverApplied: boolean;
  /** Stored changes are newer than what the server runs. */
  pendingChanges: boolean;
}

export interface FirewallView {
  serverId: string;
  moduleInstalled: boolean;
  policy: FirewallPolicyView;
  rules: FirewallRuleItem[];
}

export interface FirewallLiveRuleItem {
  /** The line ufw printed, or a readable rebuild when it is missing. */
  text: string;
  dpanelId: string;
}

export interface FirewallDefaultChange {
  direction: string;
  live: string;
  desired: string;
}

export interface FirewallPlanView {
  firewall: FirewallView;
  live: {
    available: boolean;
    reason: string;
    enabled: boolean;
  };
  toAdd: FirewallRuleItem[];
  toRemove: FirewallLiveRuleItem[];
  foreign: FirewallLiveRuleItem[];
  enabledChange: 'enable' | 'disable' | '';
  defaultChanges: FirewallDefaultChange[];
  dockerChange: 'hook' | 'unhook' | '';
  sshOpen: boolean;
  inSync: boolean;
}

const ANY_SOURCES = new Set(['', 'any', 'anywhere', '0.0.0.0/0', '::/0']);

/** True for an empty, `any` or all-addresses source. */
export function isAnySource(source: string | null | undefined): boolean {
  return ANY_SOURCES.has(
    String(source ?? '')
      .trim()
      .toLowerCase(),
  );
}

function text(value: string | null | undefined): string {
  return String(value ?? '').trim();
}

function toOrigin(value: string | null | undefined): FirewallOrigin {
  const origin = text(value).toLowerCase();
  return (FIREWALL_ORIGINS as readonly string[]).includes(origin)
    ? (origin as FirewallOrigin)
    : 'other';
}

export function toFirewallRule(
  raw: FirewallRuleV2,
  index: number,
): FirewallRuleItem {
  const origin = toOrigin(raw.origin);

  return {
    // A rule without an ID cannot be removed; the index keeps React keys unique.
    id: text(raw.id) || `rule-${index}`,
    action: text(raw.action).toLowerCase() || 'allow',
    target: text(raw.direction).toLowerCase() === 'route' ? 'docker' : 'host',
    protocol: text(raw.protocol).toLowerCase() || 'any',
    port: text(raw.port),
    source: isAnySource(raw.source) ? '' : text(raw.source),
    comment: text(raw.comment),
    origin,
    // System rules are always locked, even if an older API forgot the flag.
    locked: Boolean(raw.locked) || origin === 'system' || !text(raw.id),
  };
}

export function toFirewallLiveRule(
  raw: FirewallLiveRuleV2,
): FirewallLiveRuleItem {
  const rebuilt = [
    text(raw.action),
    raw.route ? 'route' : text(raw.direction),
    text(raw.port) || text(raw.to),
    text(raw.proto),
    text(raw.from) ? `from ${text(raw.from)}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    text: text(raw.raw) || rebuilt || '-',
    dpanelId: text(raw.dpanel_id),
  };
}

/**
 * Maps the firewall response into what the view renders. Throws on a
 * payload that is not the firewall shape, which the adapter turns into a
 * failed state.
 */
export function toFirewallView(raw: unknown): FirewallView {
  const dto = schemaFirewallV2.parse(raw);
  const policy = dto.policy ?? {};
  const version = policy.version ?? 0;
  const appliedVersion = policy.applied_version ?? 0;
  const applyInProgress = Boolean(policy.apply_in_progress);

  return {
    serverId: text(dto.server_id),
    moduleInstalled: Boolean(dto.module_installed),
    policy: {
      enabled: Boolean(policy.enabled),
      defaultIncoming: text(policy.default_incoming) || 'deny',
      defaultOutgoing: text(policy.default_outgoing) || 'allow',
      defaultRouted: text(policy.default_routed) || 'deny',
      dockerFiltering: Boolean(policy.docker_filtering),
      version,
      appliedVersion,
      appliedAt: text(policy.applied_at) || undefined,
      lastExecutionId: text(policy.last_execution_id) || undefined,
      liveCheckedAt: text(policy.live_checked_at) || undefined,
      drift: Boolean(policy.drift),
      applyInProgress,
      lastApplyStatus: text(policy.last_apply_status).toLowerCase(),
      neverApplied: appliedVersion <= 0,
      pendingChanges:
        appliedVersion > 0 && version !== appliedVersion && !applyInProgress,
    },
    rules: (dto.rules ?? []).map(toFirewallRule),
  };
}

export function toFirewallPlanView(raw: unknown): FirewallPlanView {
  const dto = schemaFirewallPlanV2.parse(raw);
  const enabledChange = text(dto.enabled_change).toLowerCase();
  const dockerChange = text(dto.docker_change).toLowerCase();

  return {
    firewall: toFirewallView(dto.firewall ?? {}),
    live: {
      available: Boolean(dto.live?.available),
      reason: text(dto.live?.reason),
      enabled: Boolean(dto.live?.enabled),
    },
    toAdd: (dto.to_add ?? []).map(toFirewallRule),
    toRemove: (dto.to_remove ?? []).map(toFirewallLiveRule),
    foreign: (dto.foreign ?? []).map(toFirewallLiveRule),
    enabledChange:
      enabledChange === 'enable' || enabledChange === 'disable'
        ? enabledChange
        : '',
    defaultChanges: (dto.default_changes ?? []).map((change) => ({
      direction: text(change.direction),
      live: text(change.live),
      desired: text(change.desired),
    })),
    dockerChange:
      dockerChange === 'hook' || dockerChange === 'unhook' ? dockerChange : '',
    sshOpen: Boolean(dto.ssh_open),
    inSync: Boolean(dto.in_sync),
  };
}

/** Color of the last apply result. */
export function applyStatusTone(status: string): StatusTone {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return 'neutral';
  if (['succeeded', 'success', 'completed', 'done'].includes(normalized)) {
    return 'success';
  }
  if (
    ['failed', 'error', 'cancelled', 'canceled', 'timeout'].includes(normalized)
  ) {
    return 'danger';
  }
  if (['running', 'queued', 'pending', 'claimed'].includes(normalized)) {
    return 'info';
  }
  return 'neutral';
}

/** Color of a rule's action. */
export function ruleActionTone(action: string): StatusTone {
  switch (action) {
    case 'allow':
      return 'success';
    case 'limit':
      return 'warning';
    case 'deny':
    case 'reject':
      return 'danger';
    default:
      return 'neutral';
  }
}

/**
 * Whether this apply turns the firewall on, which needs an explicit
 * confirmation: the policy is still off, or the plan says it will enable.
 */
export function applyTurnsFirewallOn(
  policy: Pick<FirewallPolicyView, 'enabled'>,
  plan?: Pick<FirewallPlanView, 'enabledChange'>,
): boolean {
  return !policy.enabled || plan?.enabledChange === 'enable';
}

/** The apply request for the policy the user reviewed. */
export function applyRequest(
  policy: Pick<FirewallPolicyView, 'enabled' | 'version'>,
): { version: number; enable: boolean } {
  // A disabled policy is only applied by turning it on; the dialog asks first.
  return { version: policy.version, enable: !policy.enabled };
}

/** Whether an apply or disable job is queued or running on the server. */
export function isAwaitingApply(
  policy: Pick<FirewallPolicyView, 'applyInProgress'>,
): boolean {
  return policy.applyInProgress;
}

/** A timestamp in the viewer's locale; an unparseable value is shown as sent. */
export function formatFirewallTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
