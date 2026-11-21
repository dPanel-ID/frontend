import { useNavigate } from '@tanstack/react-router';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { containerRuntime } from '../container-runtime';
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
  const moduleId = config.moduleId || config.id;

  return {
    name: moduleId,
    title: config.title || config.name,
    version: config.version || '',
    category: 'application-dependency',
    roles: config.roles,
    installation_key: runtimeItemInstallationKey(config),
    variables: config.variables,
    source: config.source === 'installed' ? 'server.installed' : 'catalog',
    module_ref: config.ref.name,
    module_source_commit: config.ref.expectedCommit,
  };
}

function runtimeItemInstallationKey(config: DependencyConfig) {
  if (config.installationKey) return config.installationKey;

  const moduleId = config.moduleId || config.id;
  if (!config.version) return moduleId;

  return `${moduleId}@${config.version}:system`;
}

function hasRuntimeItemContractMetadata(config: DependencyConfig) {
  const moduleId = String(config.moduleId || config.id)
    .trim()
    .toLowerCase();
  const roles = config.roles
    .map((role) => role.trim())
    .filter(Boolean)
    .map((role) => role.toLowerCase());

  if (roles.length === 0) return false;
  if (roles.some((role) => role === moduleId)) return false;

  return true;
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

function normalizeContractValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeContractValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        const item = (value as Record<string, unknown>)[key];
        if (item === undefined) return acc;

        const normalizedItem = normalizeContractValue(item);
        if (Array.isArray(normalizedItem) && normalizedItem.length === 0) {
          return acc;
        }

        acc[key] = normalizedItem;
        return acc;
      }, {});
  }

  return value;
}

function isContractValueEqual(left: unknown, right: unknown) {
  return (
    JSON.stringify(normalizeContractValue(left)) ===
    JSON.stringify(normalizeContractValue(right))
  );
}

function setChangedPayloadField(
  payload: Record<string, unknown>,
  key: keyof DTOs.ApplicationPayloadV1,
  value: unknown,
  originalValue: unknown,
) {
  if (isContractValueEqual(value, originalValue)) return;

  payload[key] = value;
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
  const buildEnvironment = parseEnvText(buildEnvText);
  const runtimeEnvironment = parseEnvText(runtimeEnvText);

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
      router: rawAppDefinition?.setup?.router,
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
      updateApplicationId,
      updateOriginalDefaultBranch,
      updateOriginalDomain,
      updateOriginalName,
      updateOriginalRepoName,
      updateOriginalRepoOrg,
      updateOriginalRepoUrl,
      updateOriginalRuntimeItems,
      updateOriginalSource,
      updateRawAppDefinition,
      updateTriggerBootstrap,
    } = formValues;

    if (!updateApplicationId || !hostedServerID || !appSourceGithubRepo) {
      return false;
    }

    const runtimeAppName = normalizeRuntimeAppName(
      appName,
      updateRawAppDefinition?.run?.name,
    );
    const dependencyRuntimeItems = selectedDependencyIds
      .map((id) => dependencyConfigs[id])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .filter(hasRuntimeItemContractMetadata)
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
    // A container-only application runs on Docker, stored as its language.
    const dockerRuntime = containerRuntime(
      selectedDependencyIds,
      dependencyConfigs,
    );
    if (requiredBinaries.length === 0 && dockerRuntime) {
      requiredBinaries.push(dockerRuntime);
    }
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
    const buildEnvVariables = parseEnvText(buildEnvText);
    const runtimeEnvVariables = parseEnvText(runtimeEnvText);
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
    const payload: DTOs.ApplicationPayloadV1 & Record<string, unknown> = {};

    setChangedPayloadField(
      payload,
      'app_definition',
      appDefinition,
      updateRawAppDefinition,
    );
    setChangedPayloadField(
      payload,
      'default_branch',
      gitDefaultBranch,
      updateOriginalDefaultBranch,
    );
    setChangedPayloadField(payload, 'domain', appDomain, updateOriginalDomain);
    setChangedPayloadField(payload, 'name', appName, updateOriginalName);
    setChangedPayloadField(
      payload,
      'repo_name',
      fallbackRepoName,
      updateOriginalRepoName,
    );
    setChangedPayloadField(
      payload,
      'repo_org',
      fallbackRepoOrganization,
      updateOriginalRepoOrg,
    );
    setChangedPayloadField(
      payload,
      'repo_url',
      appSourceGithubRepo,
      updateOriginalRepoUrl,
    );
    setChangedPayloadField(
      payload,
      'runtime_items',
      compiledConfig.runtime_items,
      updateOriginalRuntimeItems,
    );
    setChangedPayloadField(
      payload,
      'source',
      gitProvider,
      updateOriginalSource,
    );
    // The work directory is fixed once the application exists; the API
    // refuses a different one.

    if (updateTriggerBootstrap) {
      payload.artifact = {
        ...compiledConfig.artifact,
        app_definition: appDefinition,
        is_primary: true,
        machine_id: hostedServerID,
      };
      payload.bootstrap = true;
      payload.deploy = compiledConfig.deploy;
    }

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
      return false;
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

    return true;
  });

  return {
    handleUpdate,
  };
}
