import type { DTOs } from '@/shared/api';

/** Why an installing module is not moving yet, if dPanel can tell. */
export type InstallWait = 'queued' | 'starting' | 'packageManager';

const PACKAGE_MANAGER_WAIT_TASK = 'wait for other package installs';

/**
 * Reads an installation's job: a job still queued waits for another job on
 * the server (private servers run one at a time), and a job in the
 * package-manager wait step waits for another install's apt work.
 */
export function installWait(
  installation: Pick<DTOs.ModuleInstallationV1, 'status' | 'last_execution_id'>,
  executions: Map<string, DTOs.ExecutionV2>,
): InstallWait | undefined {
  if (
    installation.status !== 'installing' &&
    installation.status !== 'progress'
  ) {
    return undefined;
  }
  const execution = installation.last_execution_id
    ? executions.get(installation.last_execution_id)
    : undefined;
  if (!execution) return undefined;
  if (execution.status === 'queued') {
    // Only say another job is in the way when one really runs; otherwise
    // the server is still picking the job up (on a new server, preparing
    // the worker for its first job).
    const otherRunning = [...executions.values()].some(
      (other) => other.id !== execution.id && other.status === 'running',
    );
    return otherRunning ? 'queued' : 'starting';
  }
  const step =
    `${execution.last_event_phase ?? ''} ${execution.last_event_message ?? ''}`.toLowerCase();
  if (
    execution.status === 'running' &&
    step.includes(PACKAGE_MANAGER_WAIT_TASK)
  ) {
    return 'packageManager';
  }
  return undefined;
}

/** What a running install is doing now, read from its job. */
export interface InstallStep {
  /** The task the job runs, without its role name. */
  step: string;
  /**
   * When the install was asked for, to say how long it has taken. The job's
   * own start moves when its playbook begins, which leaves out the wait and
   * the server's preparation the customer sat through.
   */
  startedAt?: string;
}

/**
 * The task a running install is on, so a long install shows that it moves.
 * The job records each Ansible task as it starts; the role prefix
 * ("fauust.mariadb : ") and dPanel's own wrapper tasks are left out.
 */
export function installStep(
  installation: Pick<DTOs.ModuleInstallationV1, 'status' | 'last_execution_id'>,
  executions: Map<string, DTOs.ExecutionV2>,
): InstallStep | undefined {
  if (
    installation.status !== 'installing' &&
    installation.status !== 'progress'
  ) {
    return undefined;
  }
  const execution = installation.last_execution_id
    ? executions.get(installation.last_execution_id)
    : undefined;
  if (!execution || execution.status !== 'running') return undefined;

  const task = (execution.last_event_type ?? '').startsWith(
    'ansible_callback_task',
  )
    ? (execution.last_event_phase ?? '')
    : '';
  const step = task.split(' : ').pop()?.trim() ?? '';
  if (!step || /^run (role|generated module roles)\b/i.test(step)) {
    return {
      step: '',
      startedAt: execution.created_at ?? execution.started_at,
    };
  }
  return { step, startedAt: execution.created_at ?? execution.started_at };
}

/** "3m 12s" from a start time, or '' when it is unknown. */
export function elapsedSince(startedAt: string | undefined, now: number) {
  if (!startedAt) return '';
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return '';
  const seconds = Math.max(0, Math.floor((now - started) / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}
