import { useNavigate } from '@tanstack/react-router';

import { useAuthLoggedIn } from '@/services/auth';
import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import { ApiBundle } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useFormStore } from '../store/form';

import type { RuntimeDependency } from './config';
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

function runtimeFromDependency(
  dependencyId: string,
  variables: Record<string, unknown>,
): RuntimeDependency | null {
  const id = dependencyId.toLowerCase();
  const getString = (key: string) =>
    typeof variables[key] === 'string' ? String(variables[key]) : '';

  if (id === 'go' || id.includes('golang')) {
    return { name: 'go', version: getString('golang_version') };
  }
  if (id === 'nodejs' || id.includes('nvm') || id.includes('node')) {
    return { name: 'nodejs', version: getString('nodejs_version') };
  }
  if (id === 'php' || id.includes('php')) {
    return { name: 'php', version: getString('php_version') };
  }
  if (id === 'python' || id.includes('pyenv')) {
    const pyenvGlobal = variables.pyenv_global;
    const version = Array.isArray(pyenvGlobal)
      ? String(pyenvGlobal[0] ?? '')
      : getString('python_version');
    return { name: 'python', version };
  }
  if (id === 'ruby' || id.includes('rbenv')) {
    return { name: 'ruby', version: getString('default_ruby') };
  }
  if (id === 'bun') {
    return { name: 'bun', version: getString('bun_version') };
  }
  if (id === 'docker') {
    return { name: 'docker', version: getString('docker_version') };
  }

  return null;
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
    const dependencyRuntimes = selectedDependencyIds
      .map((id) => dependencyConfigs[id])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map((config) => runtimeFromDependency(config.id, config.variables))
      .filter((runtime): runtime is RuntimeDependency => Boolean(runtime));

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
        dependencyRuntimes,
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
