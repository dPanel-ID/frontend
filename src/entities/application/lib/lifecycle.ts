import type { DTOs } from '@/shared/api';

export interface LifecycleReleaseView {
  enabled: boolean;
  commands: string[];
  timeout: string;
}

export interface LifecyclePostDeployView {
  commands: string[];
  timeout: string;
}

export interface LifecycleProcessView {
  name: string;
  type: 'service' | 'schedule';
  command: string;
  instances: number;
}

export interface LifecycleHealthCheckView {
  path: string;
  expectedStatus: number;
  timeout: string;
  retries: number;
}

/** Release, post-deploy, processes and health check of one application. */
export interface LifecycleView {
  release: LifecycleReleaseView | null;
  postDeploy: LifecyclePostDeployView | null;
  processes: LifecycleProcessView[];
  healthCheck: LifecycleHealthCheckView | null;
}

function commandList(commands: unknown): string[] {
  if (!Array.isArray(commands)) return [];
  return commands
    .map((command) => (typeof command === 'string' ? command.trim() : ''))
    .filter(Boolean);
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function positive(value: unknown, fallback: number) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

/**
 * The lifecycle sections of a stored definition, for display and editing.
 * Definitions saved before these sections existed (or with null, empty
 * or partial sections) map to "not set", never to a crash.
 */
export function toLifecycleView(
  definition: DTOs.AppDefinition | null | undefined,
): LifecycleView {
  const release = definition?.release;
  const postDeploy = definition?.post_deploy;
  const health = definition?.health_check;
  const processes: Array<DTOs.AppDefinitionProcess | null | undefined> =
    Array.isArray(definition?.processes) ? definition.processes : [];

  return {
    release:
      release && typeof release === 'object'
        ? {
            enabled: release.enabled !== false,
            commands: commandList(release.commands),
            timeout: text(release.timeout),
          }
        : null,
    postDeploy:
      postDeploy && typeof postDeploy === 'object'
        ? {
            commands: commandList(postDeploy.commands),
            timeout: text(postDeploy.timeout),
          }
        : null,
    processes: processes
      .filter((process): process is DTOs.AppDefinitionProcess =>
        Boolean(process && text(process.name)),
      )
      .map((process) => {
        const type = process.type === 'schedule' ? 'schedule' : 'service';
        return {
          name: text(process.name),
          type,
          command: text(process.command),
          instances: type === 'schedule' ? 1 : positive(process.instances, 1),
        };
      }),
    healthCheck:
      health && typeof health === 'object' && text(health.path)
        ? {
            path: text(health.path),
            expectedStatus: positive(health.expected_status, 200),
            timeout: text(health.timeout),
            retries: positive(health.retries, 10),
          }
        : null,
  };
}

export function isLifecycleEmpty(view: LifecycleView) {
  return (
    !view.release?.commands.length &&
    !view.postDeploy?.commands.length &&
    view.processes.length === 0 &&
    !view.healthCheck
  );
}

/**
 * The app_definition patch that stores an edited lifecycle. A section the
 * user emptied is sent as null (or [] for processes), which removes it;
 * the rest of the definition is left to the stored one.
 */
export function lifecyclePatch(
  view: LifecycleView,
): Pick<
  DTOs.AppDefinition,
  'release' | 'post_deploy' | 'processes' | 'health_check'
> {
  const releaseCommands = commandList(view.release?.commands);
  const postDeployCommands = commandList(view.postDeploy?.commands);

  return {
    release:
      view.release && releaseCommands.length
        ? {
            enabled: view.release.enabled,
            commands: releaseCommands,
            ...(view.release.timeout.trim()
              ? { timeout: view.release.timeout.trim() }
              : {}),
          }
        : null,
    post_deploy:
      view.postDeploy && postDeployCommands.length
        ? {
            commands: postDeployCommands,
            ...(view.postDeploy.timeout.trim()
              ? { timeout: view.postDeploy.timeout.trim() }
              : {}),
          }
        : null,
    processes: view.processes.map((process) => ({
      name: process.name.trim(),
      type: process.type,
      command: process.command.trim(),
      ...(process.type === 'service' ? { instances: process.instances } : {}),
    })),
    health_check:
      view.healthCheck && view.healthCheck.path.trim()
        ? {
            path: view.healthCheck.path.trim(),
            expected_status: view.healthCheck.expectedStatus,
            ...(view.healthCheck.timeout.trim()
              ? { timeout: view.healthCheck.timeout.trim() }
              : {}),
            retries: view.healthCheck.retries,
          }
        : null,
  };
}
