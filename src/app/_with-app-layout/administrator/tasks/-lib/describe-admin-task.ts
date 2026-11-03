import type { DTOs } from '@/shared/api';

/** Execution states the page names; anything else is shown as unknown. */
export type AdminTaskStatus = 'pending' | 'queued' | 'running' | 'unknown';

/**
 * Who holds the task: a queue workflow waiting for a worker, a worker that
 * claimed it, or nothing at all (the workflow was lost, e.g. on a restart).
 */
export type AdminTaskGatewayState = 'waiting' | 'claimed' | 'none';

/** One unfinished task as the table needs it, with nothing left to decode. */
export interface AdminTaskRow {
  executionId: string;
  /** First block of the execution ID, enough to tell rows apart. */
  shortId: string;
  type: string | null;
  status: AdminTaskStatus;
  /** The status string as the API sent it, for the pill's tooltip. */
  rawStatus: string | null;
  workspaceId: string | null;
  serverHostname: string | null;
  serverId: string | null;
  module: string | null;
  workerId: string | null;
  gatewayState: AdminTaskGatewayState;
  /** Seconds between the worker's last heartbeat and the moment of reading. */
  heartbeatAgeSeconds: number | null;
  /** Seconds since the task last reported progress, as the API counts it. */
  idleSeconds: number | null;
  createdAt: string | null;
  /** Seconds between creation and the moment of reading. */
  ageSeconds: number | null;
  lastEventMessage: string | null;
  canReclaim: boolean;
  /** Nothing is working on it: it waits in the queue, or nothing holds it. */
  waitingForWorker: boolean;
}

export interface AdminTasksSummary {
  total: number;
  running: number;
  waitingForWorker: number;
  claimed: number;
}

const KNOWN_STATUSES: readonly AdminTaskStatus[] = [
  'pending',
  'queued',
  'running',
];

/**
 * Maps a task DTO to its row. Returns null for a record without an execution
 * ID, which no action can address.
 *
 * @param nowMs moment the list was read, so ages stay consistent per fetch.
 */
export function toAdminTaskRow(
  task: DTOs.AdminTaskV2,
  nowMs: number,
): AdminTaskRow | null {
  const executionId = clean(task.execution_id);
  if (!executionId) return null;

  const rawStatus = clean(task.status);
  const status = statusOf(rawStatus);
  const gatewayState = gatewayStateOf(task.gateway);
  const createdAt = clean(task.created_at);

  return {
    executionId,
    shortId: executionId.split('-')[0] || executionId,
    type: clean(task.type),
    status,
    rawStatus,
    workspaceId: clean(task.workspace_id),
    serverHostname: clean(task.machine_hostname),
    serverId: clean(task.machine_id),
    module: clean(task.module),
    workerId: clean(task.gateway?.worker_id),
    gatewayState,
    heartbeatAgeSeconds: secondsSince(task.gateway?.last_heartbeat_at, nowMs),
    idleSeconds:
      typeof task.idle_seconds === 'number' &&
      Number.isFinite(task.idle_seconds) &&
      task.idle_seconds >= 0
        ? Math.floor(task.idle_seconds)
        : null,
    createdAt,
    ageSeconds: secondsSince(createdAt, nowMs),
    lastEventMessage: clean(task.last_event_message),
    canReclaim: task.can_reclaim === true,
    waitingForWorker:
      gatewayState === 'waiting' ||
      (gatewayState === 'none' &&
        (status === 'queued' || status === 'pending')),
  };
}

/** Maps a whole response, dropping records no action can address. */
export function toAdminTaskRows(
  tasks: readonly DTOs.AdminTaskV2[] | null | undefined,
  nowMs: number,
): AdminTaskRow[] {
  return (tasks ?? []).flatMap((task) => {
    const row = toAdminTaskRow(task, nowMs);
    return row ? [row] : [];
  });
}

export function summarizeAdminTasks(
  rows: readonly AdminTaskRow[],
): AdminTasksSummary {
  return rows.reduce<AdminTasksSummary>(
    (summary, row) => ({
      total: summary.total + 1,
      running: summary.running + (row.status === 'running' ? 1 : 0),
      waitingForWorker:
        summary.waitingForWorker + (row.waitingForWorker ? 1 : 0),
      claimed: summary.claimed + (row.gatewayState === 'claimed' ? 1 : 0),
    }),
    { total: 0, running: 0, waitingForWorker: 0, claimed: 0 },
  );
}

/**
 * A duration in its two largest units: "45s", "5m 10s", "3h 2m", "2d 4h".
 * Short enough for a table cell and stable as the number grows.
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));

  const units: Array<[string, number]> = [
    ['d', Math.floor(seconds / 86_400)],
    ['h', Math.floor((seconds % 86_400) / 3_600)],
    ['m', Math.floor((seconds % 3_600) / 60)],
    ['s', seconds % 60],
  ];

  const first = units.findIndex(([, value]) => value > 0);
  if (first < 0) return '0s';

  return units
    .slice(first, first + 2)
    .filter(([, value]) => value > 0)
    .map(([unit, value]) => `${value}${unit}`)
    .join(' ');
}

function statusOf(raw: string | null): AdminTaskStatus {
  const status = raw?.toLowerCase();
  return KNOWN_STATUSES.find((known) => known === status) ?? 'unknown';
}

function gatewayStateOf(
  gateway: DTOs.AdminTaskGatewayV2 | null | undefined,
): AdminTaskGatewayState {
  if (!gateway) return 'none';

  const state = gateway.state?.trim().toLowerCase();
  if (state === 'claimed') return 'claimed';
  // A workflow holds the task; any state other than claimed means no worker
  // has it yet.
  return 'waiting';
}

function secondsSince(value: string | null | undefined, nowMs: number) {
  const text = clean(value);
  if (!text) return null;

  const time = Date.parse(text);
  if (Number.isNaN(time)) return null;

  return Math.max(0, Math.floor((nowMs - time) / 1000));
}

function clean(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}
