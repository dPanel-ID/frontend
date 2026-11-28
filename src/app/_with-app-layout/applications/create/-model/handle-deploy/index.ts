import { useNavigate } from '@tanstack/react-router';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { parseEnvText as parseEnvVariables } from '@/entities/application/lib/env-text';
import type { EnvVariable } from '@/entities/application/lib/env-text';
import { useDeployPreflightGuard } from '@/entities/deploy-preflight';

import { ApiBundle } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { createdApplicationRoute } from '../../-lib/created-app-route';
import { lifecycleDefinition } from '../../-lib/laravel-preset';
import { containerRuntime } from '../container-runtime';
import { useFormStore } from '../store/form';
import type {
  DependencyConfig,
  RequiredBinaryConfig,
} from '../store/form.types';

import type { RuntimeDependency, RuntimeItem } from './config';
import { getVarsGit, getVarsWordpress } from './config';

/** The variables in KEY_NAME="VALUE" text (the env step blocks bad lines). */
function parseEnvText(value: string) {
  return parseEnvVariables(value).variables.map(
    ({ key, value: text }): Record<string, string> & EnvVariable => ({
      key,
      value: text,
    }),
  );
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

  // The new runtime installer records its own key; PHP is installed by
  // branch (8.4.27 -> 8.4).
  if (config.roles.some((role) => role.trim() === 'dpanel-runtime')) {
    const version =
      moduleId === 'php'
        ? config.version.split('.').slice(0, 2).join('.')
        : config.version;
    return `${moduleId}@${version}:mise`;
  }

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

export default function useHandleDeploy() {
  const navigate = useNavigate();
  const { userProfile } = useAuthLoggedIn();

  const formValues = useFormStore((s) => s);

  const [openToaster] = useToaster();
  const t = useDevetekTranslations('page.applicationsCreate.created');
  const guardPreflight = useDeployPreflightGuard();

  const compileConfig = (
    forceSkipPreflight = false,
  ): Record<string, unknown> | null => {
    const {
      appProgLang,
      appProgLangVersion,
      appDomain,
      appName,
      appBuildCommand,
      appRunCommand,
      appPort = 0,
      appSourceBundleIdent,
      appSourceGithubRepo,
      dynamicConfig,
      hostedServerID,
      gitRepoConfig,
      buildEnvText,
      runtimeEnvText,
      dependencyConfigs,
      selectedDependencyIds,
      requiredBinaryConfigs,
      selectedRequiredBinaryIds,
      appFramework,
      lifecycle,
      preflightOverride,
    } = formValues;

    if (!appName || !appSourceBundleIdent || !hostedServerID) return null;

    const {
      gitProvider = '',
      gitHost = '',
      gitRepository = '',
      gitDefaultBranch = '',
      gitNickname = '',
      gitToken = '',
      gitBranch = '',
      gitHead = '',
      gitHeadDescription = '',
    } = gitRepoConfig || {};

    const {
      db_name: mariadbDbName = '',
      db_user: mariadbUsername = '',
      db_password: mariadbPassword = '',
    } = dynamicConfig?.['db_config'] || {};

    const buildEnvVariables = parseEnvText(buildEnvText);
    const runtimeEnvVariables = parseEnvText(runtimeEnvText);
    const legacyEnvVariables = parseEnvText(
      String(dynamicConfig?.['adv_config']?.['adv_envvar'] ?? ''),
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

    if (appSourceGithubRepo) {
      const [repoOrganization, repoName] = appSourceGithubRepo
        .replace('https://github.com/', '')
        .replace('.git', '')
        .split('/');

      return getVarsGit({
        gitProvider,
        gitHost,
        gitRepository,
        gitDefaultBranch,
        gitNickname,
        gitToken,
        gitBranch,
        gitHead,
        gitHeadDescription,
        appProgLang,
        appProgLangVersion,
        appName,
        appPort: Number(appPort),
        repoName: repoName || '',
        appBuildCommand: appBuildCommand
          .map((command) => command.trim())
          .filter(Boolean),
        appRunCommand,
        repoOrganization: repoOrganization || '',
        appDomain,
        repoURL: appSourceGithubRepo,
        serverID: hostedServerID,
        userID: Number(userProfile.id),
        mariadbDbName: String(mariadbDbName),
        mariadbUsername: String(mariadbUsername),
        mariadbPassword: String(mariadbPassword),
        envVariables: legacyEnvVariables,
        buildEnvVariables,
        runtimeEnvVariables,
        dependencyRuntimeItems,
        requiredBinaries,
        framework: appFramework,
        lifecycle: lifecycleDefinition(lifecycle),
        skipPreflight: preflightOverride || forceSkipPreflight,
      });
    }

    switch (appSourceBundleIdent) {
      case 'wordpress':
        return getVarsWordpress({
          appName,
          appDomain,
          serverID: hostedServerID,
          userID: Number(userProfile.id),
          userName: userProfile.username,
          userEmail: userProfile.email,
          mariadbDbName: String(mariadbDbName),
          mariadbUsername: String(mariadbUsername),
          mariadbPassword: String(mariadbPassword),
          envVariables: legacyEnvVariables,
        });

      default:
        return null;
    }
  };

  const submit = async (skipPreflight: boolean): Promise<boolean> => {
    const compiledConfig = compileConfig(skipPreflight);
    if (!compiledConfig) return false;

    const response = await ApiBundle.Create.doPost({
      payload: compiledConfig,
    });

    // The server's own pre-flight checks refused it (for example the
    // checks on the review step could not run): offer to deploy anyway.
    if (
      !skipPreflight &&
      guardPreflight(response, () => {
        void submit(true);
      })
    ) {
      return false;
    }

    if (response.$status !== 'success') {
      openToaster({
        title: 'Failed to create app!',
        message: response.error.message,
        variant: 'error',
      });
      return false;
    }

    // Straight to the new application's page, where its first deployment
    // shows; the list is the fallback when the response has no ID.
    openToaster({
      variant: 'success',
      title: t('title'),
      message: t('desc'),
    });
    navigate(createdApplicationRoute(response.id));

    return true;
  };

  const handleDeploy = useHandler((skipPreflight = false) =>
    submit(skipPreflight),
  );

  return {
    compileConfig,
    handleDeploy,
  };
}
