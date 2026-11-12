import type { DTOs } from '@/shared/api';

/** Why an installing module is not moving yet, if dPanel can tell. */
export type InstallWait = 'queued' | 'packageManager';

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
  if (execution.status === 'queued') return 'queued';
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
