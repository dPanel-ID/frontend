import type { RuntimeDependency } from '../handle-deploy/config';
import type { DependencyConfig } from '../store/form.types';

/** The module id of the Docker engine in the module catalog. */
const DOCKER_MODULE_ID = 'docker';

function isLanguageDependency(config?: DependencyConfig) {
  return config?.category?.some((category) => category === 'language') === true;
}

function isDockerDependency(config?: DependencyConfig) {
  return (
    String(config?.moduleId || config?.id || '')
      .trim()
      .toLowerCase() === DOCKER_MODULE_ID
  );
}

/**
 * The runtime of an application that only runs containers.
 *
 * An application whose build and start commands call `docker` needs no
 * language module, only Docker. dPanel stores it with `docker` as the
 * application language (the build and deploy roles put nothing on PATH for
 * it), so later deploys still find a definition. A language module, when one
 * is selected, always wins.
 */
export function containerRuntime(
  selectedDependencyIds: string[],
  dependencyConfigs: Record<string, DependencyConfig>,
): RuntimeDependency | undefined {
  const selected = selectedDependencyIds.map((id) => dependencyConfigs[id]);
  if (selected.some(isLanguageDependency)) return undefined;

  const docker = selected.find(isDockerDependency);
  if (!docker) return undefined;

  return { name: DOCKER_MODULE_ID, version: docker.version || '' };
}
