import { useEffect, useMemo, useState } from 'react';

import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudIcon,
  Globe2Icon,
  HouseIcon,
  Layers3Icon,
  PlusCircleIcon,
  SearchIcon,
  ServerIcon,
  TerminalIcon,
  UserRoundIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  SERVER_MODULE_CATEGORY_LABELS,
  titleizeModuleValue,
  toServerModuleFromCatalog,
} from '@/entities/server-modules/lib/catalog';
import {
  childModuleIds,
  indexCatalogModules,
} from '@/entities/server-modules/lib/catalog-index';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { ApiModule, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card, CardContent } from '@/shared/presentation/atoms/Card';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

import { useFormStore } from '../../../-model/store/form';
import type { DependencyConfig } from '../../../-model/store/form.types';
import type { ApplicationCreateServerOption } from '../../../-model/store/servers';
import { useServersStore } from '../../../-model/store/servers';

type FieldValue = unknown;

function defaultFieldValue(input: DTOs.ModuleInputV1): FieldValue {
  if (input.type === 'hidden') return input.default ?? '';
  if (input.type === 'boolean') return Boolean(input.default);
  if (input.default == null) return '';
  if (input.type === 'object') return JSON.stringify(input.default, null, 2);
  return String(input.default);
}

function parseFieldValue(input: DTOs.ModuleInputV1, value: FieldValue) {
  if (input.type === 'hidden') return value === '' ? undefined : value;
  if (input.type === 'boolean') return Boolean(value);
  if (input.type === 'number') {
    if (value === '') return undefined;
    return Number(value);
  }
  if (input.type === 'object') {
    if (value === '') return undefined;
    return JSON.parse(String(value));
  }
  return value === '' ? undefined : value;
}

function buildVariables(
  inputs: DTOs.ModuleInputV1[],
  values: Record<string, FieldValue>,
) {
  return inputs.reduce<Record<string, unknown>>((acc, input) => {
    const value = values[input.name] ?? defaultFieldValue(input);
    const parsed = parseFieldValue(input, value);
    if (parsed !== undefined) acc[input.name] = parsed;
    return acc;
  }, {});
}

function isHiddenInput(input: DTOs.ModuleInputV1) {
  return input.type === 'hidden';
}

function getDependencyVersion(
  moduleId: string,
  variables: Record<string, unknown>,
) {
  const id = moduleId.toLowerCase();
  const get = (key: string) => {
    const value = variables[key];
    if (value == null) return '';
    if (Array.isArray(value)) return String(value[0] ?? '').trim();
    return String(value).trim();
  };

  const directVersion = get(`${id}_version`);
  if (directVersion) return directVersion;
  if (id === 'go' || id.includes('golang')) return get('golang_version');
  if (id === 'nodejs' || id.includes('node') || id.includes('nvm')) {
    return get('nodejs_version');
  }
  if (id === 'php' || id.includes('php')) return get('php_version');
  if (id === 'bun') return get('bun_version');
  if (id === 'ruby' || id.includes('rbenv')) return get('default_ruby');
  if (id === 'docker') return get('docker_version');

  const pyenvGlobal = variables.pyenv_global;
  if (Array.isArray(pyenvGlobal)) return String(pyenvGlobal[0] ?? '');

  for (const [key, value] of Object.entries(variables)) {
    if (!key.endsWith('_version') || value == null) continue;
    const version = Array.isArray(value)
      ? String(value[0] ?? '').trim()
      : String(value).trim();
    if (version) return version;
  }

  return '';
}

function groupInstalledModules(modules: DTOs.ModuleInstallationV1[]) {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      installations: DTOs.ModuleInstallationV1[];
    }
  >();

  for (const installation of modules) {
    const moduleName = installation.module_name || installation.name;
    if (!moduleName) continue;

    const current = groups.get(moduleName);
    if (current) {
      current.installations.push(installation);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      name:
        installation.display_name ||
        installation.name ||
        titleizeModuleValue(moduleName),
      installations: [installation],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      installations: group.installations.sort((left, right) =>
        moduleInstanceLabel(left).localeCompare(moduleInstanceLabel(right)),
      ),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function moduleVersion(installation: DTOs.ModuleInstallationV1) {
  const variables = installation.variables ?? {};
  const moduleName = installation.module_name;
  const preferredKeys = [
    `${moduleName}_version`,
    moduleName === 'go' ? 'golang_version' : '',
    moduleName === 'nodejs' ? 'nodejs_version' : '',
    moduleName === 'python' ? 'python_version' : '',
    moduleName === 'ruby' ? 'ruby_version' : '',
    moduleName === 'bun' ? 'bun_version' : '',
    moduleName === 'php' ? 'php_version' : '',
    moduleName === 'postgresql' ? 'postgresql_version' : '',
    moduleName === 'mariadb' ? 'mariadb_use_official_repo_version' : '',
  ].filter(Boolean);

  for (const key of preferredKeys) {
    const value = variables[key];
    if (value != null && String(value).trim() !== '') {
      return String(value);
    }
  }

  for (const [key, value] of Object.entries(variables)) {
    if (key.endsWith('_version') && value != null && String(value).trim()) {
      return String(value);
    }
  }

  const keyVersion = installation.installation_key?.match(/@([^:]+)(?::|$)/);
  return keyVersion?.[1] ?? '';
}

function moduleInstanceLabel(installation: DTOs.ModuleInstallationV1) {
  const version = moduleVersion(installation);
  if (version) return version;

  const key = installation.installation_key || installation.module_name;
  if (key && key !== installation.module_name) return key;

  return installation.status || '';
}

function installedDependencySelectionId(
  installation: DTOs.ModuleInstallationV1,
) {
  return `installed:${installation.installation_key || installation.id || installation.module_name}`;
}

function isInstalledDependencySelectable(
  installation: DTOs.ModuleInstallationV1,
) {
  return !['failed', 'cancelled', 'deleted'].includes(
    String(installation.status || '').toLowerCase(),
  );
}

function buildInstalledDependencyConfig(
  moduleGroup: ReturnType<typeof groupInstalledModules>[number],
  installation: DTOs.ModuleInstallationV1,
  options: {
    catalogModule?: ServerModule;
    refName?: string;
    resolvedCommit?: string;
  },
): DependencyConfig {
  const version = moduleVersion(installation);
  const selectionId = installedDependencySelectionId(installation);

  return {
    selectionId,
    id: moduleGroup.id,
    moduleId: moduleGroup.id,
    name: moduleGroup.name,
    title: moduleGroup.name,
    version,
    category: options.catalogModule?.category,
    logoUrl: options.catalogModule?.logoUrl,
    source: 'installed',
    installationId: installation.id,
    installationKey: installation.installation_key,
    status: installation.status,
    variables: installation.variables ?? {},
    roles: installation.roles ?? [],
    ref: {
      name:
        installation.module_source_ref ||
        options.refName ||
        options.catalogModule?.refName ||
        '',
      expectedCommit:
        installation.module_source_commit ||
        installation.module_commit ||
        options.resolvedCommit ||
        options.catalogModule?.resolvedCommit ||
        '',
    },
  };
}

function dependencyModuleId(dependency: DependencyConfig) {
  return (dependency.moduleId || dependency.id).toLowerCase();
}

function moduleIdAliases(moduleId: string) {
  switch (moduleId) {
    case 'golang':
      return ['go'];
    case 'node':
      return ['nodejs'];
    default:
      return [];
  }
}

function findCatalogModuleForDependency(
  dependency: DependencyConfig,
  moduleById: Map<string, ServerModule>,
) {
  const moduleId = dependencyModuleId(dependency);
  const candidates = [moduleId, ...moduleIdAliases(moduleId)];

  for (const candidate of candidates) {
    const module = moduleById.get(candidate);
    if (module) return module;
  }

  return null;
}

function buildCatalogFallbackDependencyConfig(
  dependency: DependencyConfig,
  moduleInfo: ServerModule,
): DependencyConfig {
  return {
    ...dependency,
    category: moduleInfo.category.length
      ? moduleInfo.category
      : dependency.category,
    id: moduleInfo.id,
    installationId: undefined,
    installationKey: undefined,
    logoUrl: moduleInfo.logoUrl || dependency.logoUrl,
    moduleId: moduleInfo.id,
    name: moduleInfo.name || dependency.name,
    ref: {
      expectedCommit:
        moduleInfo.resolvedCommit || dependency.ref.expectedCommit || '',
      name: moduleInfo.refName || dependency.ref.name || '',
    },
    selectionId: moduleInfo.id,
    source: 'catalog',
    status: undefined,
    title: moduleInfo.name || dependency.title,
    version:
      dependency.version ||
      getDependencyVersion(moduleInfo.id, dependency.variables),
  };
}

type SelectableServer = ApplicationCreateServerOption;

const SectionServer = () => {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step2.sectionSelectServer',
  );

  const [
    serversStore,
    { page, refresh, setPage, searchQuery, setSearchQuery },
  ] = useServersStore();

  const [hostedServerID, setHostedServerID] = useFormStore((s) => [
    s.hostedServerID,
    s.setHostedServerID,
  ]);
  const [, { knownServersById }] = useServersStore();

  const handleClickAddNewServer = () => {
    window.open(`${import.meta.env.BASE_URL}servers/create`, '_blank')?.focus();
  };

  const totalPage =
    serversStore.$status === 'success' ? serversStore.totalPage : 1;

  let serverList = <ServerPickerLoading />;

  if (serversStore.$status === 'success') {
    const selectedKnownServer = hostedServerID
      ? knownServersById[hostedServerID]
      : undefined;
    const pickerServers = selectedKnownServer
      ? [
          selectedKnownServer,
          ...serversStore.servers.filter(
            (server) => server.id !== selectedKnownServer.id,
          ),
        ]
      : serversStore.servers;

    serverList =
      pickerServers.length > 0 ? (
        <ServerPicker
          servers={pickerServers}
          selectedId={hostedServerID}
          onSelect={setHostedServerID}
        />
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border bg-background px-4 py-8 text-center">
          <ServerIcon className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">{t('emptyTitle')}</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            {t('empty')}
          </p>
        </div>
      );
  }

  if (serversStore.$status === 'failed') {
    serverList = (
      <div className="grid gap-3 rounded-lg border bg-background p-4">
        <ErrorInline
          message={
            serversStore.error instanceof Error
              ? serversStore.error.message
              : String(serversStore.error)
          }
        />
        <Button
          className="w-fit"
          variant="outline"
          size="sm"
          onClick={() => refresh()}
        >
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="flex flex-col gap-3 p-3 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={handleClickAddNewServer}
          >
            <PlusCircleIcon className="h-4 w-4" />
            {t('btnAddNewServer')}
          </Button>

          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-sm"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {serverList}

        {totalPage > 1 && (
          <div className="mt-1 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {t('pagination', { page, totalPage })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function ServerPickerLoading() {
  return (
    <div className="flex min-h-52 justify-center rounded-lg border bg-background py-10">
      <Spinner />
    </div>
  );
}

function ServerPicker(props: {
  servers: SelectableServer[];
  selectedId?: number | null;
  onSelect: (id: number) => void;
}) {
  const { onSelect, selectedId, servers } = props;
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step2.sectionSelectServer',
  );

  return (
    <div
      className="grid max-h-[32rem] gap-2 overflow-y-auto rounded-lg border bg-background p-2"
      role="radiogroup"
      aria-label={t('title')}
    >
      {servers.map((server) => {
        const selected = selectedId === server.id;
        const status = server.status || 'unknown';
        const osLabel = [server.osName, server.osVersion]
          .filter(Boolean)
          .join(' ');
        // A server without SSH is reached through its agent. One with a
        // public address shows it; only a server without one is private.
        const metadata = server.private
          ? [
              {
                icon: server.hasPublicAddress ? Globe2Icon : HouseIcon,
                label: server.publicIP,
              },
              {
                icon: TerminalIcon,
                label: server.hasPublicAddress
                  ? t('throughAgent')
                  : t('private'),
              },
            ]
          : [
              {
                icon: Globe2Icon,
                label: server.publicIP,
              },
              {
                icon: TerminalIcon,
                label: `${t('ssh')} ${server.sshPort || '22'}`,
              },
              {
                icon: UserRoundIcon,
                label: server.defaultUser || t('unknown'),
              },
              {
                icon: CloudIcon,
                label: server.provider || t('unknown'),
              },
            ];

        return (
          <button
            key={server.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(server.id)}
            className={cn(
              'group rounded-lg border bg-card p-3 text-left transition-all',
              'hover:border-primary/50 hover:bg-primary/5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
              selected && 'border-primary bg-primary/10',
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground',
                  selected && 'border-primary/50 text-primary',
                )}
              >
                <ServerIcon className="size-5" />
              </span>

              <span className="grid min-w-0 flex-1 gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="truncate text-base font-bold text-primary">
                    {server.hostname}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                      status === 'ready'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : status === 'failed'
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : 'bg-background text-muted-foreground',
                    )}
                  >
                    <CheckCircle2Icon className="size-3" />
                    {status}
                  </span>
                </span>

                <span className="flex min-w-0 flex-wrap gap-2">
                  {metadata.map((item) => {
                    const Icon = item.icon;

                    return (
                      <span
                        key={`${server.id}-${item.label}`}
                        className="inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                    );
                  })}
                </span>

                <span className="flex min-w-0 flex-wrap gap-2">
                  {osLabel && (
                    <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {osLabel}
                    </span>
                  )}
                  {server.agentVersion && (
                    <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {t('agent')} {server.agentVersion}
                    </span>
                  )}
                </span>
              </span>

              <span
                className={cn(
                  'mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-transparent',
                  selected &&
                    'border-primary bg-primary text-primary-foreground',
                )}
              >
                <CheckCircle2Icon className="size-4" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DependencyConfigurator(props: {
  moduleInfo?: ServerModule;
  refName?: string;
  resolvedCommit?: string;
}) {
  const { moduleInfo, refName, resolvedCommit } = props;
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step2.sectionDependencies',
  );
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [formError, setFormError] = useState('');
  const [setDependencyConfig, dependencyConfigs] = useFormStore((s) => [
    s.setDependencyConfig,
    s.dependencyConfigs,
  ]);

  const [detail] = ApiModule.Detail.$Name.useGet({
    name: moduleInfo?.id ?? '',
    ref: refName,
    options: {
      skip: !moduleInfo?.id,
    },
  });

  const moduleDetail =
    detail.$status === 'success'
      ? detail
      : detail.$status === 'loading'
        ? detail.prevData
        : undefined;
  const action =
    moduleDetail?.action_details.find((item) => item.name === 'install') ??
    moduleDetail?.action_details[0];
  const existingConfig = moduleInfo ? dependencyConfigs[moduleInfo.id] : null;

  if (!moduleInfo) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        {t('selectHint')}
      </div>
    );
  }

  if (detail.$status === 'loading' && !moduleDetail) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (!moduleDetail || !action) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        {t('noOptions')}
      </div>
    );
  }

  const renderInput = (input: DTOs.ModuleInputV1) => {
    if (isHiddenInput(input)) return null;

    const value = values[input.name] ?? defaultFieldValue(input);

    return (
      <label key={input.name} className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-primary/80">
          {input.label || input.name}
          {input.required && <span className="text-destructive"> *</span>}
        </span>
        {input.description && (
          <span className="text-xs text-muted-foreground">
            {input.description}
          </span>
        )}

        {input.options?.length ? (
          <Select
            value={String(value)}
            onValueChange={(next) =>
              setValues((current) => ({ ...current, [input.name]: next }))
            }
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder={t('selectOption')} />
            </SelectTrigger>
            <SelectContent>
              {input.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : input.type === 'boolean' ? (
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                setValues((current) => ({
                  ...current,
                  [input.name]: checked === true,
                }))
              }
            />
            <span className="text-sm text-primary/70">{t('enabled')}</span>
          </div>
        ) : input.type === 'object' ? (
          <TextArea
            className="h-32 min-h-24 resize-y overflow-auto font-mono text-xs"
            value={String(value)}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [input.name]: event.target.value,
              }))
            }
          />
        ) : (
          <Input
            type={input.type === 'number' ? 'number' : 'text'}
            value={String(value)}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [input.name]: event.target.value,
              }))
            }
          />
        )}
      </label>
    );
  };

  const handleSave = () => {
    try {
      setFormError('');
      const variables = buildVariables(moduleDetail.inputs, values);
      setDependencyConfig(moduleInfo.id, {
        selectionId: moduleInfo.id,
        id: moduleInfo.id,
        moduleId: moduleInfo.id,
        name: moduleInfo.name,
        title: moduleInfo.name,
        version: getDependencyVersion(moduleInfo.id, variables),
        category: moduleInfo.category,
        logoUrl: moduleInfo.logoUrl,
        source: 'catalog',
        variables,
        roles: action.roles?.length
          ? action.roles
          : (moduleDetail.source.roles ?? [moduleDetail.id]),
        ref: {
          name: moduleDetail.input_catalog.ref_name,
          expectedCommit: moduleDetail.resolved_commit,
        },
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
    }
  };

  const visibleInputs = moduleDetail.inputs.filter(
    (input) => !isHiddenInput(input),
  );
  const requiredInputs = visibleInputs.filter((input) => input.required);
  const optionalInputs = visibleInputs.filter((input) => !input.required);

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-start justify-between gap-3 border-b px-3 py-2">
        <div>
          <h4 className="text-sm font-semibold">{moduleInfo.name}</h4>
          <p className="text-xs text-muted-foreground">
            {existingConfig ? t('configured') : t('configureHint')}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleSave}>
          {t('saveOptions')}
        </Button>
      </div>

      <div className="grid max-h-[460px] gap-4 overflow-y-auto p-3">
        <div className="rounded-lg border bg-card p-3">
          <h5 className="text-xs font-semibold text-muted-foreground">
            {t('rolesToRun')}
          </h5>
          <div className="mt-2 flex flex-wrap gap-2">
            {(action.roles?.length
              ? action.roles
              : (moduleDetail.source.roles ?? [moduleDetail.id])
            ).map((role) => (
              <span
                key={role}
                className="rounded-md bg-background px-2 py-1 text-xs font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {requiredInputs.length > 0 && (
          <div className="grid gap-3">
            <h5 className="text-xs font-semibold text-muted-foreground">
              {t('required')}
            </h5>
            {requiredInputs.map(renderInput)}
          </div>
        )}

        <div className="grid gap-3">
          <h5 className="text-xs font-semibold text-muted-foreground">
            {t('advanced')}
          </h5>
          {optionalInputs.length ? (
            optionalInputs.map(renderInput)
          ) : (
            <p className="text-sm text-muted-foreground">{t('noOptions')}</p>
          )}
        </div>

        {formError && <ErrorInline message={formError} />}
        <p className="text-xs text-muted-foreground">
          {t('source', {
            ref: moduleDetail.input_catalog.ref_name,
            commit: (resolvedCommit || moduleDetail.resolved_commit).slice(
              0,
              12,
            ),
          })}
        </p>
      </div>
    </div>
  );
}

const SectionDependencies = () => {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step2.sectionDependencies',
  );
  const [query, setQuery] = useState('');
  const [activeModuleId, setActiveModuleId] = useState<string>();
  const [flowMode, hostedServerID, selectedDependencyIds, dependencyConfigs] =
    useFormStore((s) => [
      s.flowMode,
      s.hostedServerID,
      s.selectedDependencyIds,
      s.dependencyConfigs,
    ]);
  const [toggleDependency, setDependencyConfig, replaceDependencySelection] =
    useFormStore((s) => [
      s.toggleDependency,
      s.setDependencyConfig,
      s.replaceDependencySelection,
    ]);

  const [catalogResponse] = ApiModule.Find.useGet({
    serverId: hostedServerID ? String(hostedServerID) : undefined,
    options: {
      skip: !hostedServerID,
    },
  });

  const catalog =
    catalogResponse.$status === 'success'
      ? catalogResponse
      : catalogResponse.$status === 'loading'
        ? catalogResponse.prevData
        : undefined;

  const modules = useMemo(() => {
    return (
      catalog?.modules.map((module) =>
        toServerModuleFromCatalog(
          module,
          catalog.repository.ref.name,
          catalog.repository.ref.resolved_commit,
        ),
      ) ?? []
    );
  }, [catalog]);

  const moduleById = useMemo(() => {
    return new Map(modules.map((module) => [module.id, module]));
  }, [modules]);

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return modules;
    return modules.filter((module) =>
      [module.id, module.name, module.description, module.category.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [modules, query]);

  const groupedModules = useMemo(() => {
    return filteredModules.reduce<Record<string, ServerModule[]>>(
      (acc, module) => {
        const category = module.category[0] ?? 'utilities';
        acc[category] ??= [];
        acc[category].push(module);
        return acc;
      },
      {},
    );
  }, [filteredModules]);

  const categories = useMemo(
    () =>
      Object.keys(groupedModules).sort((a, b) =>
        titleizeModuleValue(a).localeCompare(titleizeModuleValue(b)),
      ),
    [groupedModules],
  );

  const activeModule = modules.find((module) => module.id === activeModuleId);
  const [inventoryResponse] = ApiServer.Modules.$Id.useGet({
    serverId: hostedServerID ? String(hostedServerID) : '',
    options: {
      skip: !hostedServerID,
    },
  });
  // Child modules, such as databases created on MariaDB, are not
  // dependencies an application picks; they belong to their parent.
  const installedModuleGroups = useMemo(() => {
    const children = childModuleIds(indexCatalogModules(catalog?.modules));
    return groupInstalledModules(
      inventoryResponse.$status === 'success'
        ? (inventoryResponse.modules ?? []).filter(
            (installation) =>
              !children.has(
                installation.module_name || installation.name || '',
              ),
          )
        : [],
    );
  }, [catalog, inventoryResponse]);
  const installedSelectionIds = useMemo(() => {
    return new Set(
      installedModuleGroups.flatMap((moduleGroup) =>
        moduleGroup.installations.map(installedDependencySelectionId),
      ),
    );
  }, [installedModuleGroups]);

  useEffect(() => {
    if (
      flowMode !== 'update' ||
      !hostedServerID ||
      !catalog ||
      inventoryResponse.$status !== 'success'
    ) {
      return;
    }

    for (const dependencyId of selectedDependencyIds) {
      if (!dependencyId.startsWith('installed:')) continue;
      if (installedSelectionIds.has(dependencyId)) continue;

      const dependency = dependencyConfigs[dependencyId];
      if (!dependency) continue;

      const catalogModule = findCatalogModuleForDependency(
        dependency,
        moduleById,
      );
      if (!catalogModule) continue;

      replaceDependencySelection(
        dependencyId,
        catalogModule.id,
        buildCatalogFallbackDependencyConfig(dependency, catalogModule),
      );
    }
  }, [
    catalog,
    dependencyConfigs,
    flowMode,
    hostedServerID,
    installedSelectionIds,
    inventoryResponse.$status,
    moduleById,
    replaceDependencySelection,
    selectedDependencyIds,
  ]);

  const handleToggleInstalledVersion = (
    moduleGroup: (typeof installedModuleGroups)[number],
    installation: DTOs.ModuleInstallationV1,
  ) => {
    const selectionId = installedDependencySelectionId(installation);

    if (!selectedDependencyIds.includes(selectionId)) {
      setDependencyConfig(
        selectionId,
        buildInstalledDependencyConfig(moduleGroup, installation, {
          catalogModule: moduleById.get(moduleGroup.id),
          refName: catalog?.repository.ref.name,
          resolvedCommit: catalog?.repository.ref.resolved_commit,
        }),
      );
    }

    toggleDependency(selectionId);
  };

  return (
    <Card className="rounded-2xl shadow-none">
      <div className="border-b p-3 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Layers3Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold">{t('title')}</h3>
            <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
              {t('desc')}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="grid gap-4 p-3 sm:p-5">
        {!hostedServerID ? (
          <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            {t('selectServerFirst')}
          </div>
        ) : (
          <>
            <div className="rounded-lg border bg-background p-3">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold">{t('installedTitle')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('installedHint')}
                </p>
              </div>
              <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
                {installedModuleGroups.length ? (
                  installedModuleGroups.map((moduleGroup) => {
                    const singleInstallation =
                      moduleGroup.installations.length === 1
                        ? moduleGroup.installations[0]
                        : null;
                    const selectedInstallations =
                      moduleGroup.installations.filter((installation) =>
                        selectedDependencyIds.includes(
                          installedDependencySelectionId(installation),
                        ),
                      );
                    const selected = selectedInstallations.length > 0;

                    if (singleInstallation) {
                      const versionLabel =
                        moduleInstanceLabel(singleInstallation) ||
                        t('defaultInstance');
                      const selectable =
                        isInstalledDependencySelectable(singleInstallation);

                      return (
                        <button
                          key={moduleGroup.id}
                          type="button"
                          aria-pressed={selected}
                          aria-label={t(
                            !selectable
                              ? 'unavailableInstalledModuleAria'
                              : selected
                                ? 'deselectInstalledModuleAria'
                                : 'selectInstalledModuleAria',
                            {
                              module: moduleGroup.name,
                              version: versionLabel,
                            },
                          )}
                          disabled={!selectable}
                          onClick={() =>
                            handleToggleInstalledVersion(
                              moduleGroup,
                              singleInstallation,
                            )
                          }
                          className={cn(
                            'rounded-lg border bg-card p-2.5 text-left transition hover:bg-border/30',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                            selected && 'border-primary/70 bg-primary/10',
                            !selectable &&
                              'cursor-not-allowed opacity-60 hover:bg-card',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">
                              {moduleGroup.name}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {moduleGroup.installations.length}x
                              </span>
                              {selected && (
                                <CheckCircle2Icon className="size-4 text-emerald-500" />
                              )}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground',
                                selected &&
                                  'border-primary/40 bg-primary/10 text-primary',
                              )}
                            >
                              {selected && (
                                <CheckCircle2Icon className="size-3" />
                              )}
                              {versionLabel}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {!selectable
                              ? t('installedUnavailable')
                              : selected
                                ? t('selectedInstalledVersion', {
                                    count: selectedInstallations.length,
                                  })
                                : t('useInstalled')}
                          </p>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={moduleGroup.id}
                        role="group"
                        aria-label={t('installedVersionGroupAria', {
                          module: moduleGroup.name,
                        })}
                        className={cn(
                          'rounded-lg border bg-card p-2.5 transition',
                          selected && 'border-primary/70 bg-primary/10',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {moduleGroup.name}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {moduleGroup.installations.length}x
                            </span>
                            {selected && (
                              <CheckCircle2Icon className="size-4 text-emerald-500" />
                            )}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {moduleGroup.installations.map((installation) => {
                            const selectionId =
                              installedDependencySelectionId(installation);
                            const versionSelected =
                              selectedDependencyIds.includes(selectionId);
                            const selectable =
                              isInstalledDependencySelectable(installation);
                            const versionLabel =
                              moduleInstanceLabel(installation) ||
                              t('defaultInstance');

                            return (
                              <button
                                key={selectionId}
                                type="button"
                                aria-pressed={versionSelected}
                                aria-label={t(
                                  !selectable
                                    ? 'unavailableInstalledVersionAria'
                                    : versionSelected
                                      ? 'deselectInstalledVersionAria'
                                      : 'selectInstalledVersionAria',
                                  {
                                    module: moduleGroup.name,
                                    version: versionLabel,
                                  },
                                )}
                                disabled={!selectable}
                                onClick={() =>
                                  handleToggleInstalledVersion(
                                    moduleGroup,
                                    installation,
                                  )
                                }
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground transition',
                                  'hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                  versionSelected &&
                                    'border-primary/40 bg-primary/10 text-primary',
                                  !selectable &&
                                    'cursor-not-allowed opacity-60 hover:border-border hover:text-muted-foreground',
                                )}
                              >
                                {versionSelected && (
                                  <CheckCircle2Icon className="size-3" />
                                )}
                                {versionLabel}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {selected
                            ? t('selectedInstalledVersion', {
                                count: selectedInstallations.length,
                              })
                            : t('useInstalledVersion')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                    {t('noInstalled')}
                  </span>
                )}
              </div>
            </div>

            <label className="relative">
              <span className="sr-only">{t('search')}</span>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                placeholder={t('search')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="grid max-h-[680px] gap-4 overflow-y-auto pr-1">
                {catalogResponse.$status === 'loading' && !catalog ? (
                  <div className="flex justify-center py-6">
                    <Spinner />
                  </div>
                ) : categories.length ? (
                  categories.map((category) => {
                    const label =
                      SERVER_MODULE_CATEGORY_LABELS.get(category) ??
                      titleizeModuleValue(category);
                    return (
                      <section key={category} className="grid gap-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {label}
                        </h4>
                        <div className="grid gap-2 xl:grid-cols-2">
                          {(groupedModules[category] ?? []).map((module) => {
                            const selected = selectedDependencyIds.includes(
                              module.id,
                            );
                            const configured = Boolean(
                              dependencyConfigs[module.id],
                            );

                            return (
                              <button
                                key={module.id}
                                type="button"
                                className={cn(
                                  'grid gap-2 rounded-lg border bg-card p-3 text-left transition hover:bg-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                  selected && 'border-primary/70',
                                )}
                                onClick={() => setActiveModuleId(module.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <img
                                    src={module.logoUrl}
                                    alt=""
                                    className="size-9 rounded-md object-contain"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="truncate text-sm font-semibold">
                                        {module.name}
                                      </h5>
                                      {configured && (
                                        <CheckCircle2Icon className="size-4 text-emerald-500" />
                                      )}
                                    </div>
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                      {module.description || t('noDescription')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {module.installationStatus ||
                                      t('available')}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant={selected ? 'outline' : 'default'}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleDependency(module.id);
                                      setActiveModuleId(module.id);
                                    }}
                                  >
                                    {selected ? t('remove') : t('add')}
                                  </Button>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                    {t('empty')}
                  </p>
                )}
              </div>

              <DependencyConfigurator
                moduleInfo={activeModule}
                refName={catalog?.repository.ref.name}
                resolvedCommit={catalog?.repository.ref.resolved_commit}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function Step2Details() {
  return (
    <div className="flex flex-col gap-4">
      <SectionServer />
      <SectionDependencies />
    </div>
  );
}
