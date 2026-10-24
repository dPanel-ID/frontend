import { createFileRoute } from '@tanstack/react-router';
import { FileTextIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { resolveServerModuleLogo } from '@/entities/server-modules/config/registry';
import { titleizeModuleValue } from '@/entities/server-modules/lib/catalog';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Button as HeaderButton } from '@/shared/presentation/atoms/Button';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import GithubSessionBanner from '../../-view/GithubSessionBanner';
import { FormStoreProvider } from '../../create/-model/store/form';
import type {
  DependencyConfig,
  FormInitialState,
  RequiredBinaryConfig,
} from '../../create/-model/store/form.types';
import { ServersStoreProvider } from '../../create/-model/store/servers';
import type { ApplicationCreateServerOption } from '../../create/-model/store/servers';
import { ApplicationsCreateLayout as Layout } from '../../create/-presentation/Layout';
import { AsideProgress } from '../../create/-view/AsideProgress';
import { MainWizard } from '../../create/-view/MainWizard';

export const Route = createFileRoute(
  '/_with-app-layout/applications/$id/update/',
)({
  head: () => ({
    meta: [{ title: 'Update application | dnocs' }],
  }),
  component: ApplicationUpdatePage,
});

function ApplicationUpdatePage() {
  const { id } = Route.useParams();
  const t = useDevetekTranslations();

  return (
    <>
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.applications'),
                url: '/applications',
              },
              {
                text: t('page.applicationsUpdate.detailBreadcrumb'),
                url: `/applications/${id}`,
              },
            ]}
          />
        }
        title={t('page.applicationsUpdate.headerTitle')}
        description={t('page.applicationsUpdate.headerDesc')}
        rightAppend={
          <HeaderButton variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.applicationsCreate.docs')}
              title={t('page.applicationsCreate.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon className="size-4" />
              <span className="hidden sm:inline">
                {t('page.applicationsCreate.docs')}
              </span>
            </a>
          </HeaderButton>
        }
      />
      <GithubSessionBanner className="mb-6 mt-6" />
      <ApplicationUpdateBootstrap applicationId={id} />
    </>
  );
}

function ApplicationUpdateBootstrap(props: { applicationId: string }) {
  const { applicationId } = props;
  const t = useDevetekTranslations('page.applicationsUpdate');
  const { gitProfile } = useAuthLoggedIn();
  const [applicationResponse] = ApiApplication.Detail.$Id.useGet({
    applicationId,
  });
  const isRepositoryApplication =
    applicationResponse.$status === 'success' &&
    Boolean(
      applicationResponse.source_type === 'github' ||
      applicationResponse.repo_url ||
      (applicationResponse.repo_org && applicationResponse.repo_name),
    );
  const [iacConfigResponse] = ApiApplication.IAC.$Id.useGet({
    applicationId,
    options: {
      skip:
        applicationResponse.$status !== 'success' || !isRepositoryApplication,
    },
  });

  if (applicationResponse.$status === 'loading') {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border bg-card">
        <Spinner />
      </div>
    );
  }

  if (applicationResponse.$status === 'failed') {
    return (
      <div className="rounded-lg border bg-card p-4">
        <ErrorInline message={applicationResponse.error.message} />
      </div>
    );
  }

  if (!isRepositoryApplication) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        {t('repositoryOnly')}
      </div>
    );
  }

  if (
    iacConfigResponse.$status === 'initial' ||
    iacConfigResponse.$status === 'loading'
  ) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border bg-card">
        <Spinner />
      </div>
    );
  }

  if (iacConfigResponse.$status === 'failed') {
    return (
      <div className="rounded-lg border bg-card p-4">
        <ErrorInline
          message={t('iacConfigError', {
            message: iacConfigResponse.error.message,
          })}
        />
      </div>
    );
  }

  const initialForm = buildInitialFormState(
    applicationResponse,
    {
      gitNickname: gitProfile?.login || '',
      // The server mints the repository token itself.
      gitToken: '',
    },
    iacConfigResponse,
  );
  const initialServers = buildInitialServers(applicationResponse);

  return (
    <ServersStoreProvider initialServers={initialServers}>
      <FormStoreProvider {...initialForm}>
        <Layout>
          <AsideProgress />
          <Layout.Main>
            <MainWizard />
          </Layout.Main>
        </Layout>
      </FormStoreProvider>
    </ServersStoreProvider>
  );
}

function buildInitialFormState(
  application: DTOs.ApplicationV1,
  git: {
    gitNickname: string;
    gitToken: string;
  },
  iacConfig?: DTOs.ApplicationIACConfigV1,
): FormInitialState {
  const appDefinition = application.app_definition;
  const rawBuild = appDefinition?.build?.target?.machine;
  const rawRun = appDefinition?.run;
  const originalServerID = application.deploys?.[0]?.machine_id ?? null;
  const originalPort = rawRun?.port ? String(rawRun.port) : '';
  const repoUrl = application.repo_url || githubRepositoryUrl(application);
  const repoBranch =
    application.artifacts?.[0]?.branch || application.default_branch || '';
  const originalWorkdir =
    application.workdir ||
    appDefinition?.build?.target?.machine?.workdir ||
    appDefinition?.build?.target?.machine?.workir ||
    '';
  const runtimeDependencies = buildRuntimeDependencyConfigs(
    application,
    iacConfig,
  );
  const selectedDependencyIds = Array.from(
    new Set(runtimeDependencies.map((item) => item.id)),
  );
  const dependencyConfigs = runtimeDependencies.reduce<
    Record<string, DependencyConfig>
  >((acc, item) => {
    acc[item.id] = item.config;
    return acc;
  }, {});
  const requiredBinaryConfigs = runtimeDependencies.reduce<
    Record<string, RequiredBinaryConfig>
  >((acc, item) => {
    if (!item.requiredBinary) return acc;
    acc[item.requiredBinary.selectionId] = item.requiredBinary;
    return acc;
  }, {});
  const selectedRequiredBinaryIds = Object.keys(requiredBinaryConfigs);

  return {
    appBuildCommand:
      rawBuild?.steps
        ?.flatMap((step) => step.command ?? [])
        .filter((command) => command.trim()) ?? [],
    buildEnvText: envTextFromDefinition(rawBuild?.environment),
    appDomain: application.domain || '',
    appName: application.name || '',
    appPort: originalPort,
    appRunCommand: rawRun?.command || '',
    appSourceBundleIdent:
      application.bundle_type ||
      appDefinition?.setup?.language?.name ||
      application.source_type ||
      'github',
    appSourceGithubRepo: repoUrl,
    appSourceMode: 'github',
    dependencyConfigs,
    flowMode: 'update',
    gitRepoConfig: {
      gitBranch: repoBranch,
      gitDefaultBranch: application.default_branch || repoBranch,
      gitHead: application.artifacts?.[0]?.head || '',
      gitHeadDescription: application.artifacts?.[0]?.description || '',
      gitHost: 'github.com',
      gitNickname: git.gitNickname,
      gitProvider: 'github',
      gitRepository: repoUrl || '',
      gitToken: git.gitToken,
    },
    hostedServerID: originalServerID,
    progress: '2-server-dependencies',
    requiredBinaryConfigs,
    runtimeEnvText: envTextFromDefinition(rawRun?.environment),
    selectedDependencyIds,
    selectedRequiredBinaryIds,
    updateApplicationConfig: application.app_config ?? null,
    updateApplicationId: application.id ? String(application.id) : null,
    updateOriginalDefaultBranch: application.default_branch || '',
    updateOriginalDomain: application.domain || '',
    updateOriginalName: application.name || '',
    updateOriginalRepoName: application.repo_name || '',
    updateOriginalRepoOrg: application.repo_org || '',
    updateOriginalRepoUrl: application.repo_url || '',
    updateOriginalRuntimeItems:
      iacConfig?.runtime_items ?? getApplicationRuntimeItems(application),
    updateOriginalSource: application.source || '',
    updateOriginalPort: originalPort,
    updateOriginalServerID: originalServerID,
    updateOriginalWorkdir: originalWorkdir,
    updateRawAppDefinition: appDefinition ?? null,
    updateWorkdir: originalWorkdir,
  };
}

function envTextFromDefinition(
  environment?: Array<{ key?: string; value?: string | null }> | null,
) {
  return (environment ?? [])
    .map((item) => {
      const key = String(item.key || '').trim();
      if (!key) return null;

      return `${key}=${item.value ?? ''}`;
    })
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function buildInitialServers(
  application: DTOs.ApplicationV1,
): ApplicationCreateServerOption[] {
  return (application.deploys ?? []).reduce<ApplicationCreateServerOption[]>(
    (acc, deploy) => {
      const machine = deploy.machine;
      const id = Number(machine?.id ?? deploy.machine_id);
      if (!id) return acc;

      acc.push({
        id,
        hostname: machine?.hostname || `Server ${id}`,
        publicIP: machine?.address || machine?.domain || '-',
        agentVersion: machine?.agent_version,
        defaultUser: machine?.default_user,
        domain: machine?.domain,
        error: machine?.error,
        inventoryRefreshedAt: machine?.inventory_refreshed_at,
        osName: machine?.distributor ?? machine?.os_family,
        osVersion: machine?.version,
        provider: machine?.provider,
        region: machine?.region,
        sshPort: machine?.ssh_port,
        status: machine?.status,
      });

      return acc;
    },
    [],
  );
}

function buildRuntimeDependencyConfigs(
  application: DTOs.ApplicationV1,
  iacConfig?: DTOs.ApplicationIACConfigV1,
) {
  if (iacConfig?.generated_playbook.exists) {
    return iacConfig.runtime_items
      .map((item) => dependencyFromRuntimeItem(item))
      .filter((item) => item.id);
  }

  const languageDependencies = [
    application.app_definition?.setup?.language,
    ...(application.app_definition?.setup?.languages ?? []),
  ]
    .filter(
      (runtime): runtime is { name?: string; version?: string | number } =>
        Boolean(runtime?.name),
    )
    .map((runtime) => runtimeDependencyFromDefinition(runtime));
  const languageIds = new Set(languageDependencies.map((item) => item.id));
  const runtimeItems = getApplicationRuntimeItems(application)
    .filter((item) => {
      const name = normalizeDependencyName(item.name);
      return name && !languageIds.has(name);
    })
    .map((item) => dependencyFromRuntimeItem(item));

  return [...languageDependencies, ...runtimeItems];
}

function runtimeDependencyFromDefinition(runtime: {
  name?: string;
  version?: string | number;
}) {
  const id = normalizeDependencyName(runtime.name);
  const version = runtime.version == null ? '' : String(runtime.version);
  const config: DependencyConfig = {
    category: ['language'],
    id,
    logoUrl: resolveServerModuleLogo({ id }),
    moduleId: id,
    name: titleizeModuleValue(id),
    ref: {
      expectedCommit: '',
      name: '',
    },
    roles: [id],
    selectionId: id,
    source: 'catalog',
    title: titleizeModuleValue(id),
    variables: {},
    version,
  };
  const requiredBinary: RequiredBinaryConfig = {
    dependencySelectionId: id,
    id,
    logoUrl: config.logoUrl,
    moduleId: id,
    name: config.name,
    selectionId: `binary:${id}`,
    source: 'catalog',
    title: config.title,
    version,
  };

  return {
    config,
    id,
    requiredBinary,
  };
}

function dependencyFromRuntimeItem(item: DTOs.ApplicationIACRuntimeItemV1) {
  const id = normalizeDependencyName(item.name);
  const source = isInstalledRuntimeItem(item) ? 'installed' : 'catalog';
  const selectionId =
    source === 'installed' && item.installation_key
      ? `installed:${item.installation_key}`
      : id;
  const category = runtimeItemCategories(item, id);
  const config: DependencyConfig = {
    category,
    id,
    installationKey: item.installation_key,
    logoUrl: resolveServerModuleLogo({ id }),
    moduleId: id,
    name: item.title || titleizeModuleValue(id),
    ref: {
      expectedCommit: item.module_source_commit || '',
      name: item.module_ref || '',
    },
    roles: item.roles ?? [id],
    selectionId,
    source,
    title: item.title || titleizeModuleValue(id),
    variables: item.variables ?? {},
    version: item.version || runtimeItemVersion(id, item.variables ?? {}),
  };

  return {
    config,
    id: selectionId,
    requiredBinary: category.includes('language')
      ? {
          dependencySelectionId: selectionId,
          id,
          logoUrl: config.logoUrl,
          moduleId: id,
          name: config.name,
          selectionId: `binary:${selectionId}`,
          source: config.source,
          title: config.title,
          version: config.version,
        }
      : null,
  };
}

function runtimeItemVersion(
  moduleId: string,
  variables: Record<string, unknown>,
) {
  const normalizedId = normalizeDependencyName(moduleId);
  const get = (key: string) => {
    const value = variables[key];
    if (value == null) return '';
    if (Array.isArray(value)) return String(value[0] ?? '').trim();
    return String(value).trim();
  };

  const preferredKeys = [
    `${normalizedId}_version`,
    normalizedId === 'go' || normalizedId === 'golang' ? 'golang_version' : '',
    normalizedId === 'node' || normalizedId === 'nodejs'
      ? 'nodejs_version'
      : '',
    normalizedId === 'python' ? 'python_version' : '',
    normalizedId === 'ruby' ? 'ruby_version' : '',
    normalizedId === 'bun' ? 'bun_version' : '',
    normalizedId === 'php' ? 'php_version' : '',
    normalizedId === 'postgresql' ? 'postgresql_version' : '',
    normalizedId === 'mariadb' ? 'mariadb_use_official_repo_version' : '',
    'pyenv_global',
  ].filter(Boolean);

  for (const key of preferredKeys) {
    const version = get(key);
    if (version) return version;
  }

  for (const [key, value] of Object.entries(variables)) {
    if (!key.endsWith('_version') || value == null) continue;
    const version = Array.isArray(value)
      ? String(value[0] ?? '').trim()
      : String(value).trim();
    if (version) return version;
  }

  return '';
}

function getApplicationRuntimeItems(
  application: DTOs.ApplicationV1,
): DTOs.ApplicationIACRuntimeItemV1[] {
  const maybeRuntimeItems = (application as { runtime_items?: unknown })
    .runtime_items;
  if (!Array.isArray(maybeRuntimeItems)) return [];

  return maybeRuntimeItems.filter(
    (item): item is DTOs.ApplicationIACRuntimeItemV1 => {
      const runtimeItem = item as Partial<DTOs.ApplicationIACRuntimeItemV1>;
      return Boolean(
        item &&
        typeof item === 'object' &&
        String(runtimeItem.name || '').trim(),
      );
    },
  );
}

function isInstalledRuntimeItem(item: DTOs.ApplicationIACRuntimeItemV1) {
  return item.source === 'server.installed' || item.source === 'installed';
}

function runtimeItemCategories(
  item: DTOs.ApplicationIACRuntimeItemV1,
  normalizedName: string,
) {
  if (item.category && item.category !== 'application-dependency') {
    return [item.category];
  }

  if (isLanguageModuleName(normalizedName)) return ['language'];

  return ['utilities'];
}

function isLanguageModuleName(name: string) {
  return [
    'bun',
    'go',
    'golang',
    'node',
    'nodejs',
    'php',
    'python',
    'ruby',
  ].includes(name);
}

function normalizeDependencyName(name?: string) {
  return String(name || '')
    .trim()
    .toLowerCase();
}

function githubRepositoryUrl(application: DTOs.ApplicationV1) {
  if (!application.repo_org || !application.repo_name) return '';
  return `https://github.com/${application.repo_org}/${application.repo_name}`;
}
