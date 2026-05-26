import { useNavigate } from '@tanstack/react-router';

import { useAuthLoggedIn } from '@/services/auth';
import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import { ApiBundle } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useFormStore } from '../store/form';
import type {
  DependencyConfig,
  RequiredBinaryConfig,
} from '../store/form.types';

import type { RuntimeDependency, RuntimeItem } from './config';
import { getVarsGit, getVarsLaravel, getVarsWordpress } from './config';

function parseEnvText(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Array<Record<string, string>>>((acc, line) => {
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

export default function useHandleDeploy() {
  const navigate = useNavigate();
  const { userProfile } = useAuthLoggedIn();

  const formValues = useFormStore((s) => s);

  const [openToaster] = useToaster();
  const [openDialog] = useDialog();

  const compileConfig = (): Record<string, unknown> | null => {
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
      .map((config) => runtimeItemFromDependency(config));
    const requiredBinaries = selectedRequiredBinaryIds
      .map((id) => requiredBinaryConfigs[id])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map(runtimeFromRequiredBinary);

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

      case 'laravel': {
        const laravelDBConnection = [
          {
            key: 'DB_CONNECTION',
            value: 'mysql',
          },
          {
            key: 'DB_HOST',
            value: 'localhost',
          },
          {
            key: 'DB_PORT',
            value: '3306',
          },
          {
            key: 'DB_DATABASE',
            value: String(mariadbDbName),
          },
          {
            key: 'DB_USERNAME',
            value: String(mariadbUsername),
          },
          {
            key: 'DB_PASSWORD',
            value: String(mariadbPassword),
          },
        ];
        legacyEnvVariables.push(...laravelDBConnection);

        return getVarsLaravel({
          appName,
          appDomain,
          serverID: hostedServerID,
          userID: Number(userProfile.id),
          mariadbDbName: String(mariadbDbName),
          mariadbUsername: String(mariadbUsername),
          mariadbPassword: String(mariadbPassword),
          envVariables: legacyEnvVariables,
        });
      }

      default:
        return null;
    }
  };

  const handleDeploy = useHandler(async () => {
    const compiledConfig = compileConfig();
    if (!compiledConfig) return;

    const response = await ApiBundle.Create.doPost({
      payload: compiledConfig,
    });

    if (response.$status !== 'success') {
      openToaster({
        title: 'Failed to create app!',
        message: response.error.message,
        variant: 'error',
      });
      return;
    }

    openDialog({
      title: 'Successfully created your app!',
      content: 'Now sit back and relax while we prepare your app.',
      variant: 'info',
      actions: {
        variant: 'Ok',
        ok: () => {
          navigate({
            to: '/applications',
            replace: true,
          });
        },
      },
    });
  });

  return {
    handleDeploy,
  };
}
