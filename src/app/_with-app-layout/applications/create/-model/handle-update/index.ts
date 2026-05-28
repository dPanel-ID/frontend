import { useNavigate } from '@tanstack/react-router';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { RuntimeDependency, RuntimeItem } from '../handle-deploy/config';
import { getVarsGit } from '../handle-deploy/config';
import { useFormStore } from '../store/form';
import type {
  DependencyConfig,
  RequiredBinaryConfig,
} from '../store/form.types';

function parseEnvText(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Array<{ key: string; value: string }>>((acc, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex <= 0) return acc;

      acc.push({
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      });
      return acc;
    }, []);
}

function runtimeFromRequiredBinary(
  binary: RequiredBinaryConfig,
): RuntimeDependency {
  return {
    name: binary.moduleId || binary.id,
    version: binary.version || '',
  };
}

function runtimeItemFromDependency(config: DependencyConfig): RuntimeItem {
  return {
    name: config.moduleId || config.id,
    title: config.title || config.name,
    version: config.version || '',
    category: 'application-dependency',
    roles: config.roles,
    installation_key:
      config.installationKey ||
      `${config.moduleId || config.id}@${config.version || 'default'}:application`,
    variables: config.variables,
    source: config.source === 'installed' ? 'server.installed' : 'catalog',
    module_ref: config.ref.name,
    module_source_commit: config.ref.expectedCommit,
  };
}

function isLanguageDependency(config?: DependencyConfig) {
  return config?.category?.some((category) => category === 'language') === true;
}

function requiredBinaryIdForDependency(
  dependencyId: string,
  dependency?: DependencyConfig,
) {
  return `binary:${dependency?.selectionId || dependencyId}`;
}

function parseGithubRepository(repoUrl?: string | null) {
  const normalized = (repoUrl || '')
    .replace('https://github.com/', '')
    .replace('git@github.com:', '')
    .replace('.git', '')
    .replace(/^\/+|\/+$/g, '');
  const [repoOrganization = '', repoName = ''] = normalized.split('/');

  return {
    repoName,
    repoOrganization,
  };
}

const VALID_RUNTIME_APP_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function normalizeRuntimeAppName(name: string, fallback?: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  if (VALID_RUNTIME_APP_NAME.test(normalized)) return normalized;

  const fallbackName = String(fallback || '').trim();
  if (VALID_RUNTIME_APP_NAME.test(fallbackName)) return fallbackName;

  return 'application';
}

function buildUpdatedAppDefinition(params: {
  appBuildCommand: string[];
  appPort: string;
  appRunCommand: string;
  buildEnvText: string;
  rawAppDefinition: DTOs.AppDefinition | null | undefined;
  requiredBinaries: RuntimeDependency[];
  runtimeAppName: string;
  runtimeEnvText: string;
}) {
  const {
    appBuildCommand,
    appPort,
    appRunCommand,
    buildEnvText,
    rawAppDefinition,
    requiredBinaries,
    runtimeAppName,
    runtimeEnvText,
  } = params;
  const rawBuild = rawAppDefinition?.build?.target?.machine;
  const rawRun = rawAppDefinition?.run;
  const normalizedRuntimes = requiredBinaries.filter((runtime) => runtime.name);
  const primaryRuntime =
    normalizedRuntimes[0] ?? rawAppDefinition?.setup?.language ?? {};
  const primaryRuntimeName = String(primaryRuntime.name || '');
  const primaryRuntimeVersion =
    primaryRuntime.version == null ? '' : String(primaryRuntime.version);
  const extraRuntimes = normalizedRuntimes.slice(1);
  const buildEnvironment = buildEnvText.trim()
    ? parseEnvText(buildEnvText)
    : (rawBuild?.environment ?? []);
  const runtimeEnvironment = runtimeEnvText.trim()
    ? parseEnvText(runtimeEnvText)
    : (rawRun?.environment ?? []);

  return {
    version: rawAppDefinition?.version ?? 'v0.0.1-alpha.0',
    setup: {
      ...rawAppDefinition?.setup,
      language: {
        name: primaryRuntimeName,
        version: primaryRuntimeVersion,
      },
      languages: extraRuntimes.map((runtime) => ({
        name: runtime.name,
        version: runtime.version || '',
      })),
      router: rawAppDefinition?.setup?.router ?? null,
    },
    build: {
      ...rawAppDefinition?.build,
      target: {
        ...rawAppDefinition?.build?.target,
        machine: {
          ...rawBuild,
          steps: [
            {
              name:
                rawBuild?.steps?.[0]?.name || 'Build application from github',
              command: appBuildCommand
                .map((command) => command.trim())
                .filter(Boolean),
              archive: rawBuild?.steps?.[0]?.archive,
            },
          ],
          environment: buildEnvironment,
        },
      },
    },
    run: {
      ...rawRun,
      name: runtimeAppName,
      port: Number(appPort),
      config: null,
      command: appRunCommand,
      environment: runtimeEnvironment,
    },
  } satisfies DTOs.AppDefinition;
}

export default function useHandleUpdateApplication() {
  const navigate = useNavigate();
  const t = useDevetekTranslations('page.applicationsUpdate.toaster');
  const { userProfile } = useAuthLoggedIn();
  const formValues = useFormStore((s) => s);
  const [openToaster] = useToaster();

  const handleUpdate = useHandler(async () => {
    const {
      appBuildCommand,
      appDomain,
      appName,
      appPort,
      appRunCommand,
      appSourceGithubRepo,
      buildEnvText,
      dependencyConfigs,
      gitRepoConfig,
      hostedServerID,
      requiredBinaryConfigs,
      runtimeEnvText,
      selectedDependencyIds,
      selectedRequiredBinaryIds,
      updateApplicationConfig,
      updateApplicationId,
      updateRawAppDefinition,
      updateTriggerBootstrap,
      updateWorkdir,
    } = formValues;

    if (!updateApplicationId || !hostedServerID || !appSourceGithubRepo) return;

    const runtimeAppName = normalizeRuntimeAppName(
      appName,
      updateRawAppDefinition?.run?.name,
    );
    const dependencyRuntimeItems = selectedDependencyIds
      .map((id) => dependencyConfigs[id])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map((config) => runtimeItemFromDependency(config));
    const languageRequiredBinaryIds = new Set(
      selectedDependencyIds
        .filter((id) => isLanguageDependency(dependencyConfigs[id]))
        .map((id) => requiredBinaryIdForDependency(id, dependencyConfigs[id])),
    );
    const requiredBinaries = selectedRequiredBinaryIds
      .filter((id) => languageRequiredBinaryIds.has(id))
      .map((id) => requiredBinaryConfigs[id])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map(runtimeFromRequiredBinary);
    const appDefinition = buildUpdatedAppDefinition({
      appBuildCommand,
      appPort,
      appRunCommand,
      buildEnvText,
      rawAppDefinition: updateRawAppDefinition,
      requiredBinaries,
      runtimeAppName,
      runtimeEnvText,
    });
    const buildEnvVariables = buildEnvText.trim()
      ? parseEnvText(buildEnvText)
      : (updateRawAppDefinition?.build?.target?.machine?.environment ?? []);
    const runtimeEnvVariables = runtimeEnvText.trim()
      ? parseEnvText(runtimeEnvText)
      : (updateRawAppDefinition?.run?.environment ?? []);
    const {
      repoName: fallbackRepoName,
      repoOrganization: fallbackRepoOrganization,
    } = parseGithubRepository(appSourceGithubRepo);
    const {
      gitProvider = 'github',
      gitHost = 'github.com',
      gitRepository = appSourceGithubRepo,
      gitDefaultBranch = '',
      gitNickname = '',
      gitToken = '',
      gitBranch = gitDefaultBranch,
      gitHead = '',
      gitHeadDescription = '',
    } = gitRepoConfig || {};
    const compiledConfig = getVarsGit({
      appBuildCommand: appBuildCommand
        .map((command) => command.trim())
        .filter(Boolean),
      appDomain,
      appName: runtimeAppName,
      appPort: Number(appPort),
      appRunCommand,
      dependencyRuntimeItems,
      envVariables: [],
      gitBranch,
      gitDefaultBranch,
      gitHead,
      gitHeadDescription,
      gitHost,
      gitNickname,
      gitProvider,
      gitRepository,
      gitToken,
      mariadbDbName: '',
      mariadbPassword: '',
      mariadbUsername: '',
      repoName: fallbackRepoName,
      repoOrganization: fallbackRepoOrganization,
      repoURL: appSourceGithubRepo,
      requiredBinaries,
      serverID: hostedServerID,
      userID: Number(userProfile.id),
      buildEnvVariables,
      runtimeEnvVariables,
    });
    const payload = {
      app_config: updateApplicationConfig || undefined,
      app_definition: appDefinition,
      artifact: {
        ...compiledConfig.artifact,
        app_definition: appDefinition,
        is_primary: true,
        machine_id: hostedServerID,
      },
      bootstrap: updateTriggerBootstrap || undefined,
      default_branch: gitDefaultBranch || undefined,
      deploy: compiledConfig.deploy,
      domain: appDomain || undefined,
      name: appName,
      playbook: compiledConfig.playbook,
      repo_name: fallbackRepoName || undefined,
      repo_org: fallbackRepoOrganization || undefined,
      repo_url: appSourceGithubRepo,
      runtime_items: compiledConfig.runtime_items,
      source: gitProvider,
      source_type: 'github',
      workdir:
        updateWorkdir ||
        updateRawAppDefinition?.build?.target?.machine?.workdir ||
        undefined,
    } satisfies DTOs.ApplicationV1 & Record<string, unknown>;

    const response = await ApiApplication.Update.$Id.doPost({
      applicationId: updateApplicationId,
      payload,
    });

    if (response.$status !== 'success') {
      openToaster({
        title: t('errorTitle'),
        message: response.error.message,
        variant: 'error',
      });
      return;
    }

    openToaster({
      message: t('success', { name: appName }),
      variant: 'success',
    });
    navigate({
      to: '/applications/$id',
      params: {
        id: updateApplicationId,
      },
    });
  });

  return {
    handleUpdate,
  };
}
