import { useMemo, useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  Layers3Icon,
  RefreshCwIcon,
  SearchIcon,
  ServerIcon,
} from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import type { ServerCard } from '@/entities/server/rules/schema';
import { ServerStatusPill } from '@/entities/server/ui/ServerStatusPill';
import { useModuleVersionLabel } from '@/entities/server-modules/lib/version';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import {
  getSelectedServer,
  getServerName,
  getServerPublicAddress,
  hasInstalledModule,
  hasReportedGatewayModule,
  moduleInstallationLabels,
} from '../-lib/modules';
import type { Form } from '../-model/form';
import type { CreateResources } from '../-model/resources';

import { StateBlock } from './-presentation/fields';

export function ServerPicker(props: {
  form: Form;
  resources: CreateResources;
}) {
  const { form, resources } = props;
  const t = useDevetekTranslations();
  const serverId = useController({ control: form.control, name: 'serverId' });
  const servers = resources.servers;
  const selectedServer = getSelectedServer(resources, serverId.field.value);
  const canGoPrev = servers.$status === 'success' && resources.serverPage > 1;
  const canGoNext =
    servers.$status === 'success' &&
    resources.serverPage < servers.pagination.total_page;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-bold">
            {t('sidepanel.loadBalancerCreation.fieldServer.title')}
            <span className="text-destructive">*</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('page.loadBalancersCreate.gateway.serverHint')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={resources.serverSearch}
              onChange={(event) =>
                resources.setServerSearch(event.currentTarget.value)
              }
              placeholder={t('page.loadBalancersCreate.gateway.searchServer')}
              aria-label={t('page.loadBalancersCreate.gateway.searchServer')}
            />
          </div>
          <Button
            size="icon"
            buttonStyle="outline"
            buttonColor="secondary"
            title={t('common.actions.refresh')}
            aria-label={t('common.actions.refresh')}
            onClick={() => resources.refreshServers()}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 p-3 2xl:grid-cols-2">
        {servers.$status === 'loading' && (
          <StateBlock>
            <Spinner />
            <span>{t('page.loadBalancersCreate.loading')}</span>
          </StateBlock>
        )}

        {servers.$status === 'failed' && (
          <StateBlock>
            {t('sidepanel.loadBalancerCreation.fieldServer.onError')}
          </StateBlock>
        )}

        {servers.$status === 'success' &&
          servers.list.map((server) => (
            <ServerOption
              key={server.id}
              server={server}
              selected={serverId.field.value === server.id}
              onSelect={() => {
                // A new server starts without an engine. That is the
                // next thing to pick, not a mistake to flag yet.
                if (serverId.field.value !== server.id) {
                  form.setValue('engine', '');
                  form.clearErrors('engine');
                }
                serverId.field.onChange(server.id);
              }}
            />
          ))}

        {servers.$status === 'success' && servers.list.length < 1 && (
          <StateBlock>
            {t('page.loadBalancersCreate.gateway.noServers')}
          </StateBlock>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {selectedServer
            ? t('page.loadBalancersCreate.gateway.selectedServer', {
                server: getServerName(selectedServer),
              })
            : t('page.loadBalancersCreate.gateway.noSelectedServer')}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!canGoPrev}
            onClick={() => resources.setServerPage(resources.serverPage - 1)}
          >
            <ArrowLeftIcon />
            {t('common.actions.previous')}
          </Button>
          <span>
            {servers.$status === 'success'
              ? t('page.loadBalancersCreate.gateway.pageOf', {
                  page: resources.serverPage,
                  total: Math.max(servers.pagination.total_page, 1),
                })
              : t('page.loadBalancersCreate.gateway.pageOf', {
                  page: resources.serverPage,
                  total: 1,
                })}
          </span>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!canGoNext}
            onClick={() => resources.setServerPage(resources.serverPage + 1)}
          >
            {t('common.actions.next')}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <ErrorInline t={t} message={serverId.fieldState.error?.message} />
      </div>
    </Card>
  );
}

export function ServerOption(props: {
  server: ServerCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { onSelect, selected, server } = props;
  const t = useDevetekTranslations();
  // Only a server dNocs can reach and configure can run the engine.
  const selectable = server.state.status === 'ready';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!selectable}
      aria-pressed={selected}
      title={
        selectable ? undefined : t('page.loadBalancersCreate.gateway.notReady')
      }
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selectable && 'hover:border-sky-400/40',
        selected && 'border-sky-400/60 bg-sky-500/10',
        !selectable && 'cursor-not-allowed opacity-55',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card">
        <ServerIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold">
            {getServerName(server)}
          </span>
          <ServerStatusPill state={server.state} size="sm" />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[
            // The address the DNS record goes to, as dNocs creates it; an
            // agent server without a public IP shows its local one.
            getServerPublicAddress(server) ?? server.host.address,
            [server.system.name, server.system.version]
              .filter(Boolean)
              .join(' '),
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-sky-500 bg-sky-500 text-white'
            : 'bg-card text-transparent',
        )}
      >
        <CheckCircle2Icon className="size-4" />
      </span>
    </button>
  );
}

export function EnginePicker(props: {
  form: Form;
  resources: CreateResources;
}) {
  const { form, resources } = props;
  const t = useDevetekTranslations();
  const [query, setQuery] = useState('');
  const [openServerModulesDetailModal] = useServerModulesDetailModal();
  const engine = useController({ control: form.control, name: 'engine' });
  const serverId = useWatch({ control: form.control, name: 'serverId' });
  const modules =
    resources.infrastructureModules.$status === 'success'
      ? resources.infrastructureModules
      : resources.infrastructureModules.$status === 'loading'
        ? resources.infrastructureModules.prevData
        : undefined;
  const reportedModules = useMemo(
    () => (modules?.list ?? []).filter(hasReportedGatewayModule),
    [modules],
  );
  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = modules?.list ?? [];

    if (!normalizedQuery) return list;

    return list.filter((module) =>
      [module.id, module.name, module.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [modules, query]);
  const availableModules = useMemo(
    () => filteredModules.filter((module) => !hasReportedGatewayModule(module)),
    [filteredModules],
  );

  const openModuleInstaller = (module: ServerModule) => {
    if (!serverId) return;

    const server = getSelectedServer(resources, serverId);
    openServerModulesDetailModal({
      moduleInfo: module,
      onServerInstallQueued: resources.refreshModules,
      serverID: serverId,
      serverName: server ? getServerName(server) : undefined,
    });
  };

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Layers3Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <h3 className="text-sm font-bold">
              {t('sidepanel.loadBalancerCreation.fieldEngine.title')}
              <span className="text-destructive">*</span>
            </h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {t('page.loadBalancersCreate.gateway.engineHint')}
            </p>
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-3">
        {!serverId && (
          <StateBlock>
            {t('page.loadBalancersCreate.gateway.selectServerFirst')}
          </StateBlock>
        )}

        {serverId &&
          resources.infrastructureModules.$status === 'loading' &&
          !modules && (
            <StateBlock>
              <Spinner />
              <span>
                {t('page.loadBalancersCreate.gateway.loadingEngines')}
              </span>
            </StateBlock>
          )}

        {serverId && resources.infrastructureModules.$status === 'failed' && (
          <StateBlock>
            <span>
              {t('page.loadBalancersCreate.gateway.engineLoadFailed')}
            </span>
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => resources.refreshModules()}
            >
              <RefreshCwIcon />
              {t('common.actions.refresh')}
            </Button>
          </StateBlock>
        )}

        {serverId && modules && (
          <>
            <section className="grid gap-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-sm font-bold">
                    {t(
                      'page.loadBalancersCreate.gateway.installedInfrastructureTitle',
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'page.loadBalancersCreate.gateway.installedInfrastructureDescription',
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  title={t('common.actions.refresh')}
                  aria-label={t('common.actions.refresh')}
                  onClick={() => resources.refreshModules()}
                >
                  <RefreshCwIcon />
                  {t('common.actions.refresh')}
                </Button>
              </div>

              <div
                className="grid gap-2"
                role="radiogroup"
                aria-label={t(
                  'page.loadBalancersCreate.gateway.installedInfrastructureTitle',
                )}
              >
                {reportedModules.length > 0 ? (
                  reportedModules.map((module) => {
                    const installed = hasInstalledModule(module);

                    return (
                      <InstalledEngineOption
                        key={module.id}
                        module={module}
                        selected={engine.field.value === module.id}
                        installed={installed}
                        detailStatus={resources.selectedEngineDetail.$status}
                        runtimeReady={Boolean(
                          resources.selectedEngineRuntimeItem,
                        )}
                        onSelect={() => {
                          // Validated on pick: the picker is a set of
                          // buttons, never blurred, so "onTouched" would
                          // otherwise keep an earlier "Required".
                          if (installed) {
                            form.setValue('engine', module.id, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                    );
                  })
                ) : (
                  <StateBlock>
                    {t(
                      'page.loadBalancersCreate.gateway.noInstalledInfrastructure',
                    )}
                  </StateBlock>
                )}
              </div>
            </section>

            <section className="grid gap-3 border-t pt-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="text-sm font-bold">
                    {t(
                      'page.loadBalancersCreate.gateway.availableInfrastructureTitle',
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'page.loadBalancersCreate.gateway.availableInfrastructureDescription',
                    )}
                  </p>
                </div>

                <div className="relative w-full md:max-w-xs">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    placeholder={t(
                      'page.loadBalancersCreate.gateway.searchEngine',
                    )}
                    aria-label={t(
                      'page.loadBalancersCreate.gateway.searchEngine',
                    )}
                    disabled={!serverId}
                  />
                </div>
              </div>

              {modules.list.length < 1 ? (
                <StateBlock>
                  {t(
                    'page.loadBalancersCreate.gateway.noInfrastructureEngines',
                  )}
                </StateBlock>
              ) : availableModules.length < 1 ? (
                <StateBlock>
                  {query
                    ? t('page.loadBalancersCreate.gateway.noEnginesForSearch')
                    : t(
                        'page.loadBalancersCreate.gateway.noAvailableInfrastructure',
                      )}
                </StateBlock>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {availableModules.map((module) => (
                    <AvailableEngineModuleCard
                      key={module.id}
                      module={module}
                      onOpen={() => openModuleInstaller(module)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        {engine.field.value &&
        resources.selectedEngineDetail.$status === 'failed' ? (
          <div className="flex flex-wrap items-center gap-2">
            <ErrorInline
              t={t}
              message={t('page.loadBalancersCreate.gateway.engineDetailFailed')}
            />
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => resources.refreshSelectedEngineDetail()}
            >
              <RefreshCwIcon />
              {t('common.actions.refresh')}
            </Button>
          </div>
        ) : (
          <ErrorInline t={t} message={engine.fieldState.error?.message} />
        )}
      </div>
    </Card>
  );
}

export function InstalledEngineOption(props: {
  module: ServerModule;
  selected: boolean;
  installed: boolean;
  detailStatus: string;
  runtimeReady: boolean;
  onSelect: () => void;
}) {
  const { detailStatus, installed, module, onSelect, runtimeReady, selected } =
    props;
  const t = useDevetekTranslations();
  const versionLabel = useModuleVersionLabel();
  const installedLabels = moduleInstallationLabels(module);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={!installed}
      onClick={onSelect}
      className={cn(
        'grid gap-3 rounded-lg border bg-background p-4 text-left transition-colors md:grid-cols-[auto_minmax(0,1fr)_auto]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected && 'border-primary bg-primary/10',
        !installed && 'cursor-not-allowed opacity-75',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-card">
        <img
          src={module.logoUrl}
          alt=""
          className="size-7 object-contain"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-base font-bold">{module.name}</span>
          <Badge variant="secondary">
            {t('page.loadBalancersCreate.gateway.infrastructureCategory')}
          </Badge>
          {installed ? (
            <Badge variant="outline" className="text-emerald-600">
              {t('page.loadBalancersCreate.gateway.installedBadge')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600">
              {t('page.loadBalancersCreate.gateway.installingBadge')}
            </Badge>
          )}
          {selected && detailStatus === 'loading' && (
            <Badge variant="outline">
              {t('page.loadBalancersCreate.gateway.loadingMetadata')}
            </Badge>
          )}
          {selected && runtimeReady && (
            <Badge variant="outline" className="text-emerald-600">
              {t('page.loadBalancersCreate.gateway.playbookReady')}
            </Badge>
          )}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {module.description ||
            t('page.loadBalancersCreate.gateway.engineRuntime')}
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {(installedLabels.length > 0
            ? installedLabels
            : [module.refName]
          ).map(
            (label) =>
              label && (
                <Badge
                  key={label}
                  variant="secondary"
                  title={module.resolvedCommit}
                >
                  {versionLabel(label)}
                </Badge>
              ),
          )}
        </span>
      </span>

      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full border',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground',
        )}
      >
        {selected && <CheckCircle2Icon className="size-5" />}
      </span>
    </button>
  );
}

export function AvailableEngineModuleCard(props: {
  module: ServerModule;
  onOpen: () => void;
}) {
  const { module, onOpen } = props;
  const t = useDevetekTranslations();
  const versionLabel = useModuleVersionLabel();

  return (
    <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-card">
        <img
          src={module.logoUrl}
          alt=""
          className="size-7 object-contain"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-base font-bold">{module.name}</span>
          <Badge variant="secondary">
            {t('page.loadBalancersCreate.gateway.infrastructureCategory')}
          </Badge>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {module.description ||
            t('page.loadBalancersCreate.gateway.engineRuntime')}
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {module.refName && (
            <Badge variant="secondary" title={module.resolvedCommit}>
              {versionLabel(module.refName)}
            </Badge>
          )}
        </span>
      </span>

      <Button
        className="self-center"
        size="sm"
        buttonStyle="outline"
        buttonColor="secondary"
        title={t('page.loadBalancersCreate.gateway.openInstallModal')}
        aria-label={t('page.loadBalancersCreate.gateway.openInstallModal')}
        onClick={onOpen}
      >
        {t('page.loadBalancersCreate.gateway.openInstallModal')}
      </Button>
    </div>
  );
}
