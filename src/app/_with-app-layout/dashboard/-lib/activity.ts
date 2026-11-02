import { personOf } from '@/entities/user/lib/person';
import type { Person } from '@/entities/user/lib/person';

import type { DTOs } from '@/shared/api';

/**
 * Lifecycle states a reader cares about. Legacy and empty statuses collapse
 * to 'unknown' rather than leaking a raw backend string into the UI.
 */
export type ExecutionLifecycle =
  | 'pending'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'unknown';

/** Lifecycle states that mean the platform is still working on something. */
const IN_FLIGHT_LIFECYCLES: ReadonlySet<ExecutionLifecycle> = new Set([
  'pending',
  'queued',
  'running',
]);

/** Lifecycle states a user is expected to act on. */
const ATTENTION_LIFECYCLES: ReadonlySet<ExecutionLifecycle> = new Set([
  'failed',
  'cancelled',
]);

/**
 * An agent quiet for longer than this is reported as out of contact. Agent
 * heartbeats are minutes apart, so this tolerates a missed beat or two
 * without crying wolf.
 */
export const AGENT_STALE_AFTER_MS = 15 * 60 * 1000;

const SENSITIVE_ASSIGNMENT_PATTERN =
  /\b(password|passwd|token|secret|api[_-]?key|credential|authorization|private[_-]?key|access[_-]?key)\b(\s*[:=]\s*)(\S+)/gi;

/** Replaces any `key: value` secret in free text with a redaction marker. */
export function redactSecrets(value: string) {
  return value.replace(
    SENSITIVE_ASSIGNMENT_PATTERN,
    (_match, key: string, separator: string) => `${key}${separator}[redacted]`,
  );
}

/** Classifies a stored execution status into a lifecycle state. */
export function executionLifecycle(status?: string): ExecutionLifecycle {
  switch (
    String(status ?? '')
      .trim()
      .toLowerCase()
  ) {
    case 'pending':
      return 'pending';
    case 'queued':
      return 'queued';
    case 'running':
      return 'running';
    case 'succeeded':
      return 'succeeded';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'unknown';
  }
}

export function isInFlightLifecycle(lifecycle: ExecutionLifecycle) {
  return IN_FLIGHT_LIFECYCLES.has(lifecycle);
}

export function needsAttentionLifecycle(lifecycle: ExecutionLifecycle) {
  return ATTENTION_LIFECYCLES.has(lifecycle);
}

/**
 * Turns an execution type into a stable i18n key segment. Unknown and legacy
 * types return undefined so the caller can fall back to a humanised label
 * rather than rendering a missing translation.
 */
export function executionTypeKey(type?: string): string | undefined {
  const normalized = String(type ?? '')
    .trim()
    .toLowerCase();
  if (!normalized) return undefined;

  switch (normalized) {
    case 'machine_setup':
      return 'machineSetup';
    // The agent reports its own create as 'machine_machine.create'; without
    // that case it humanised to "Machine machine create".
    case 'machine_cloud_origin_create':
    case 'user_machine_create':
    case 'machine_machine.create':
      return 'machineCreate';
    case 'machine_cloud_origin_delete':
    case 'machine_machine.delete':
    case 'user_machine_delete':
      return 'machineDelete';
    case 'cloud_orphan_vm_delete':
      return 'orphanCleanup';
    case 'module_install':
    case 'module.install':
    case 'iac_module_install':
      return 'moduleInstall';
    case 'iac_custom_playbook':
      return 'customPlaybook';
    case 'ansible':
      return 'ansible';
    case 'agent_rpc':
    case 'agent_command':
      return 'agentCommand';
    // Deployments report as '<module>_<action>', which humanised to
    // "Deployment deployment create".
    case 'deployment_deployment.create':
      return 'deploymentCreate';
    case 'deployment_deployment.delete':
      return 'deploymentDelete';
    case 'firewall_apply':
      return 'firewallApply';
    case 'firewall_disable':
      return 'firewallDisable';
    default:
      return undefined;
  }
}

/**
 * Renders an unrecognised identifier as a readable label, so a legacy or
 * newly added execution type degrades to "Module install" rather than
 * "iac_module_install" or a blank cell.
 */
export function humanizeIdentifier(value?: string) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    // A module-prefixed type repeats itself: "deployment deployment create".
    .replace(/\b(\w+)( \1\b)+/gi, '$1');
  if (!normalized) return '';

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/** Milliseconds an execution ran for, when both ends are known. */
export function executionDurationMs(
  execution: DTOs.ExecutionV2,
): number | undefined {
  const started = parseTime(execution.started_at ?? execution.created_at);
  const finished = parseTime(execution.finished_at);
  if (started == null || finished == null) return undefined;

  const duration = finished - started;
  return duration >= 0 ? duration : undefined;
}

// git prints "From <remote>" / "To <remote>" on stderr for every fetch and
// push, so the agent records it as an error even when nothing went wrong.
const GIT_REMOTE_NOTICE_PATTERN = /^(From|To) [a-z][\w+.-]*:\/\/\S+$/i;

/**
 * The most specific failure text available, redacted. Prefers the first
 * error, which names the cause, over the last event, which is often just
 * "playbook failed".
 */
export function executionFailureSummary(
  execution: DTOs.ExecutionV2,
  lifecycle: ExecutionLifecycle = executionLifecycle(execution.status),
): string | undefined {
  const candidates = [execution.first_error_message, execution.error];

  // last_event_message is the last thing that happened, not necessarily a
  // problem: on a successful run it reads "Ansible execution succeeded".
  // Only reach for it once the execution is known to need attention, or a
  // success ends up presented as a failure.
  if (needsAttentionLifecycle(lifecycle)) {
    candidates.push(execution.last_event_message);
  }

  const candidate = candidates.find((value) => {
    const text = String(value ?? '').trim();
    return Boolean(text) && !GIT_REMOTE_NOTICE_PATTERN.test(text);
  });

  if (!candidate) return undefined;
  return redactSecrets(String(candidate).trim());
}

/** Label for the machine an execution ran against. */
export function executionTarget(
  execution: DTOs.ExecutionV2,
): string | undefined {
  const label = [execution.machine_hostname, execution.machine_address].find(
    (value) => Boolean(String(value ?? '').trim()),
  );
  return label ? String(label).trim() : undefined;
}

/**
 * The first label of a host name, e.g. "web-01" for
 * "web-01.asia-southeast2-a.c.example.internal". Addresses stay whole.
 */
export function shortHostLabel(target: string) {
  if (/^[\d.]+$/.test(target) || target.includes(':')) return target;
  return target.split('.')[0] || target;
}

/** Sort key, newest first, tolerant of missing timestamps. */
export function executionSortTime(execution: DTOs.ExecutionV2) {
  return (
    parseTime(execution.last_event_at) ??
    parseTime(execution.finished_at) ??
    parseTime(execution.started_at) ??
    parseTime(execution.created_at) ??
    0
  );
}

/** The timestamp to show for an execution. */
export function executionTimestamp(
  execution: DTOs.ExecutionV2,
): string | undefined {
  return (
    execution.finished_at ??
    execution.started_at ??
    execution.created_at ??
    execution.last_event_at
  );
}

export interface ActivityItem {
  id: string;
  lifecycle: ExecutionLifecycle;
  /** i18n key segment for the activity label, when the type is recognised. */
  typeKey?: string;
  /** Readable fallback label for an unrecognised type. */
  typeFallback: string;
  target?: string;
  actor?: string;
  /** The actor as a person to link to, when the API resolved them. */
  actorPerson?: Person;
  module?: string;
  timestamp?: string;
  sortTime: number;
  durationMs?: number;
  failureSummary?: string;
  needsAttention: boolean;
  inFlight: boolean;
  errorCount: number;
  warningCount: number;
  /** Raw status, shown only inside the technical disclosure. */
  rawStatus?: string;
  rawType?: string;
  traceId?: string;
  machineId?: string;
}

/** Projects a stored execution into the shape the activity feed renders. */
export function toActivityItem(execution: DTOs.ExecutionV2): ActivityItem {
  const lifecycle = executionLifecycle(execution.status);

  return {
    id:
      execution.id ||
      `${execution.machine_id ?? ''}:${execution.created_at ?? ''}`,
    lifecycle,
    typeKey: executionTypeKey(execution.type),
    typeFallback: humanizeIdentifier(execution.type),
    target: executionTarget(execution),
    actor: execution.actor_subject?.trim() || undefined,
    actorPerson: personOf(execution.actor),
    module: execution.module?.trim() || undefined,
    timestamp: executionTimestamp(execution),
    sortTime: executionSortTime(execution),
    durationMs: executionDurationMs(execution),
    failureSummary: executionFailureSummary(execution, lifecycle),
    needsAttention: needsAttentionLifecycle(lifecycle),
    inFlight: isInFlightLifecycle(lifecycle),
    errorCount: execution.error_count ?? 0,
    warningCount: execution.warning_count ?? 0,
    rawStatus: execution.status,
    rawType: execution.type,
    traceId: execution.trace_id,
    machineId: execution.machine_id,
  };
}

/** Newest first. */
export function sortActivityItems(items: ActivityItem[]) {
  return [...items].sort((left, right) => right.sortTime - left.sortTime);
}

/** Agents whose last heartbeat is older than the staleness tolerance. */
export function staleAgents(agents: DTOs.AgentV2[], now = Date.now()) {
  return agents.filter((agent) => {
    const lastSeen = parseTime(agent.last_seen_at);
    if (lastSeen == null) return true;
    return now - lastSeen > AGENT_STALE_AFTER_MS;
  });
}

function parseTime(value?: string) {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
