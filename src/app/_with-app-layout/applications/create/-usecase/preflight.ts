import { useEffect, useMemo } from 'react';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { sortPreflightChecks } from '../-lib/laravel-preset';
import useHandleDeploy from '../-model/handle-deploy';
import { useFormStore } from '../-model/store/form';

interface PlaybookRole {
  name?: string;
  variable?: Record<string, unknown>;
}

/** The definition the create payload builds from (the dpanel-build input). */
export function definitionFromCompiledConfig(
  config: Record<string, unknown> | null,
): DTOs.AppDefinition | null {
  const playbook = config?.playbook as { roles?: PlaybookRole[] } | undefined;
  const build = playbook?.roles?.find((role) => role.name === 'dpanel-build');
  const definition = build?.variable?.build_application_from_input;
  if (!definition || typeof definition !== 'object') return null;
  return withoutVariableValues(definition);
}

/**
 * The checks read runtimes and commands only: variable values (database
 * passwords among them) are not sent.
 */
function withoutVariableValues(
  definition: DTOs.AppDefinition,
): DTOs.AppDefinition {
  const machine = definition.build?.target?.machine;
  return {
    ...definition,
    build: definition.build
      ? {
          ...definition.build,
          target: {
            ...definition.build.target,
            machine: machine ? { ...machine, environment: [] } : machine,
          },
        }
      : definition.build,
    run: definition.run
      ? { ...definition.run, environment: [] }
      : definition.run,
  };
}

function repositoryOf(config: Record<string, unknown> | null) {
  return {
    owner: String(config?.repo_org ?? ''),
    name: String(config?.repo_name ?? ''),
  };
}

/**
 * Runs the pre-flight checks for a recognised framework on the review
 * step, again whenever the definition changes. The results gate the
 * deploy button (see isPreflightBlocking); a check that cannot run says so
 * and never blocks, since the server checks again before deploying.
 */
export function usePreflight() {
  const [
    flowMode,
    appFramework,
    gitRepoConfig,
    selectedDependencyIds,
    dependencyConfigs,
    preflight,
    setPreflight,
  ] = useFormStore((s) => [
    s.flowMode,
    s.appFramework,
    s.gitRepoConfig,
    s.selectedDependencyIds,
    s.dependencyConfigs,
    s.preflight,
    s.setPreflight,
  ]);
  const { compileConfig } = useHandleDeploy();
  const config = compileConfig();
  const definition = definitionFromCompiledConfig(config);
  const { owner, name } = repositoryOf(config);
  const branch = gitRepoConfig?.gitBranch || gitRepoConfig?.gitDefaultBranch;
  const modules = useMemo(
    () =>
      Array.from(
        new Set(
          selectedDependencyIds
            .map((id) => dependencyConfigs[id])
            .map((dependency) =>
              (dependency?.moduleId || dependency?.id || '').toLowerCase(),
            )
            .filter(Boolean),
        ),
      ),
    [dependencyConfigs, selectedDependencyIds],
  );
  const enabled =
    flowMode === 'create' && appFramework !== '' && !!definition && !!owner;
  const key = enabled
    ? JSON.stringify({ owner, name, branch, definition, modules })
    : '';

  const run = useHandler(async () => {
    if (!enabled || !branch) return;
    setPreflight({ status: 'loading', key, blocking: false, checks: [] });
    const response = await ApiApplication.Preflight.doPost({
      payload: {
        repo_org: owner,
        repo_name: name,
        branch,
        app_definition: definition,
        modules,
      },
    });
    if (response.$status !== 'success') {
      setPreflight({ status: 'failed', key, blocking: false, checks: [] });
      return;
    }
    setPreflight({
      status: 'done',
      key,
      blocking: response.blocking === true,
      checks: sortPreflightChecks(response.checks),
    });
  });

  useEffect(() => {
    if (!key || preflight.key === key) return;
    void run();
  }, [key, preflight.key, run]);

  const current =
    preflight.key === key
      ? preflight
      : { ...preflight, status: 'idle' as const };

  return { enabled, preflight: current, retry: run };
}
