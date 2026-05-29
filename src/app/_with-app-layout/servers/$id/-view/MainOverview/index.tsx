import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  AppWindowIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  DatabaseIcon,
  GitBranchIcon,
  GlobeIcon,
  HardDriveIcon,
  Layers3Icon,
  NetworkIcon,
  PuzzleIcon,
  RefreshCwIcon,
  ServerCogIcon,
  ShieldCheckIcon,
  TerminalIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import {
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import {
  SERVER_MODULE_CATEGORY_LABELS,
  titleizeModuleValue,
} from '@/entities/server-modules/lib/catalog';
import { getModuleInfoByFind } from '@/entities/server-modules/model/getModuleInfo';

import { ApiApplication, ApiLoadBalancer, ApiService } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';

import { useEmit, useSubscribe } from '../../-model/events';
import { useServerDataModel } from '../../-model/server-data';
import useModuleInstallationDelete from '../../-usecase/module-installation-delete';
import AsideStatistics from '../AsideStatistics';

const DATABASE_MODULE_IDS = new Set([
  'mariadb',
  'mongodb',
  'mysql',
  'postgresql',
  'redis',
]);

const DATABASE_SERVICE_KEYWORDS = [
  'mariadb',
  'mongodb',
  'mongod',
  'mysql',
  'postgres',
  'postgresql',
  'redis',
];

export default function MainOverview() {
  const emit = useEmit();
  const [isRefreshingModules, setIsRefreshingModules] = useState(false);
  const [selectedInstallation, setSelectedInstallation] =
    useState<SelectedInstallation | null>(null);
  const [openToaster] = useToaster();
  const [serverId, detail, moduleState] = useServerDataModel((s) => [
    String(s.serverId),
    s.detail,
    s.modules,
  ]);
  const [refreshModuleInventory] = useServerDataModel((s) => [
    s.refreshModuleInventory,
  ]);
  const [refreshModules] = useServerDataModel((s) => [s.refreshModules]);

  const shouldSkip = detail.$status !== 'success';

  const [applicationsResponse, refreshApplications] =
    ApiApplication.Find.useGet({
      page: 1,
      limit: 12,
      options: {
        skip: shouldSkip,
      },
    });

  const [loadBalancersResponse, refreshLoadBalancers] =
    ApiLoadBalancer.Find.useGet({
      machineId: serverId,
      page: 1,
      limit: 1,
      options: {
        skip: shouldSkip,
      },
    });

  const [servicesResponse, refreshOverviewServices] =
    ApiService.Origin.$ServerId.useGet({
      serverId,
      page: 1,
      pageSize: 12,
      options: {
        skip: shouldSkip,
      },
    });

  useSubscribe('@servers::detail/server-services-refresh', () => {
    refreshApplications();
    refreshLoadBalancers();
    refreshOverviewServices();
  });

  const detailData =
    detail.$status === 'success'
      ? detail
      : detail.$status === 'loading'
        ? detail.prevData
        : undefined;

  const applicationsData = responseData(applicationsResponse);
  const loadBalancersData = responseData(loadBalancersResponse);
  const servicesData = responseData(servicesResponse);
  const modulesData = responseData(moduleState);

  const overview = useMemo(() => {
    const applications = applicationsData?.applications ?? [];
    const modules = modulesData?.modules ?? [];
    const services = servicesData?.services ?? [];

    const deployedApplications = applications.filter((application) =>
      application.deploys?.some(
        (deployment) => String(deployment.machine_id) === serverId,
      ),
    );

    const runningApplications = deployedApplications.filter((application) =>
      application.deploys?.some((deployment) => {
        if (String(deployment.machine_id) !== serverId) return false;
        const service = deployment.service as
          | { active?: string; state?: string }
          | undefined;
        return (
          service?.active === 'active' ||
          service?.state === 'running' ||
          deployment.installer_status === 'ready'
        );
      }),
    );

    const installedModules = modules.filter(
      (module) => module.status === 'installed',
    );

    const databaseModules = installedModules.filter((module) =>
      DATABASE_MODULE_IDS.has(module.module_name),
    );

    const databaseServices = services.filter((service) =>
      DATABASE_SERVICE_KEYWORDS.some((keyword) =>
        normalizeServiceName(service.name).includes(keyword),
      ),
    );

    const activeDatabaseServices = databaseServices.filter(
      (service) => service.active === 'active' || service.state === 'running',
    );

    return {
      applications: deployedApplications,
      runningApplications,
      loadBalancerCount:
        loadBalancersData?.pagination.total_item ??
        loadBalancersData?.routers?.length ??
        0,
      moduleInventory: modules,
      installedModules,
      databaseModules,
      databaseServices,
      activeDatabaseServices,
      services,
    };
  }, [
    applicationsData,
    loadBalancersData,
    modulesData,
    serverId,
    servicesData,
  ]);

  const systemLabel = [detailData?.system.name, detailData?.system.version]
    .filter(Boolean)
    .join(' ');

  const handleClickDiscoverModules = () => {
    emit('@servers::detail/favorite-navigation', {
      to: 'modules-discover',
    });
  };

  const handleClickRefreshModules = async () => {
    setIsRefreshingModules(true);
    const response = await refreshModuleInventory();
    setIsRefreshingModules(false);

    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: <>Refresh failed</>,
        message: getApiErrorDetail(response.error),
      });
      return;
    }

    openToaster({
      variant: 'success',
      message: <>Server modules refreshed.</>,
    });
  };

  return (
    <>
      <Card className="rounded-2xl">
        <div className="border-b px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ServerCogIcon className="size-5 text-primary/75" />
                <h2 className="text-lg font-bold text-primary">
                  Server Overview
                </h2>
              </div>
              <p className="mt-1 text-sm text-primary/55">
                Live workload, module, and operating system summary for this
                server.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill
                icon={CircleCheckIcon}
                label={detailData?.state.status ?? 'unknown'}
                tone={
                  detailData?.state.status === 'ready' ? 'success' : 'muted'
                }
              />
              <StatusPill
                icon={HardDriveIcon}
                label={systemLabel || 'OS unknown'}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-4">
          <AsideStatistics />

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <MetricCard
              icon={AppWindowIcon}
              label="Applications"
              value={overview.applications.length}
              detail={`${overview.runningApplications.length} running on this server`}
              tone="blue"
            />
            <MetricCard
              icon={NetworkIcon}
              label="Load Balancers"
              value={overview.loadBalancerCount}
              detail="Bound to this machine"
              tone="green"
            />
            <MetricCard
              icon={DatabaseIcon}
              label="Databases"
              value={overview.databaseModules.length}
              detail={`${overview.activeDatabaseServices.length} active service${overview.activeDatabaseServices.length === 1 ? '' : 's'}`}
              tone="amber"
            />
            <MetricCard
              icon={PuzzleIcon}
              label="Installed Modules"
              value={overview.installedModules.length}
              detail={`${overview.moduleInventory.length} tracked in dPanel inventory`}
              tone="violet"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <section className="rounded-xl border bg-background/40">
              <SectionHeader icon={TerminalIcon} title="Server Details" />
              <div className="divide-y">
                <InfoRow
                  icon={GlobeIcon}
                  label="Public IP"
                  value={detailData?.host.address}
                />
                <InfoRow
                  icon={TerminalIcon}
                  label="SSH"
                  value={[
                    detailData?.ssh.defaultUser || 'root',
                    detailData?.ssh.port ? `:${detailData.ssh.port}` : '',
                  ].join('')}
                />
                <InfoRow
                  icon={HardDriveIcon}
                  label="Operating System"
                  value={systemLabel || '-'}
                />
                <InfoRow
                  icon={GitBranchIcon}
                  label="Agent"
                  value={detailData?.agent.version || '-'}
                />
                <InfoRow
                  icon={ShieldCheckIcon}
                  label="Ownership"
                  value={
                    detailData?.ownership.team || detailData?.ownership.owner
                  }
                />
              </div>
            </section>

            <section className="rounded-xl border bg-background/40">
              <SectionHeader icon={DatabaseIcon} title="Database Monitoring" />

              <div className="flex flex-col gap-3 p-3">
                <DatabaseEngineGrid modules={overview.databaseModules} />
                <DatabaseServiceList services={overview.databaseServices} />
              </div>
            </section>
          </div>

          <section className="rounded-xl border bg-background/40">
            <SectionHeader
              icon={Layers3Icon}
              title="Installed Modules"
              action={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClickDiscoverModules}
                  >
                    Discover
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRefreshingModules}
                    onClick={handleClickRefreshModules}
                  >
                    <RefreshCwIcon className="size-4" />
                    Refresh
                  </Button>
                </div>
              }
            />
            <InstalledServiceSummary
              modules={overview.moduleInventory}
              onSelectInstallation={setSelectedInstallation}
            />
          </section>
        </div>
      </Card>

      <InstalledModuleDialog
        serverId={serverId}
        selected={selectedInstallation}
        onDeleted={() => {
          refreshModules();
          setSelectedInstallation(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelectedInstallation(null);
        }}
      />
    </>
  );
}

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}

function MetricCard(props: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
  tone: 'amber' | 'blue' | 'green' | 'violet';
}) {
  const { icon: Icon, label, value, detail, tone } = props;

  return (
    <div className="flex min-h-28 items-center gap-3 rounded-xl border bg-background/55 p-4">
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          {
            'bg-blue-500/15 text-blue-400': tone === 'blue',
            'bg-green-500/15 text-green-400': tone === 'green',
            'bg-amber-500/15 text-amber-400': tone === 'amber',
            'bg-violet-500/15 text-violet-400': tone === 'violet',
          },
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-primary">{value}</p>
        <p className="text-sm font-semibold text-primary/75">{label}</p>
        <p className="truncate text-xs text-primary/50">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeader(props: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  const { icon: Icon, title, action } = props;

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary/65" />
        <h3 className="truncate text-sm font-bold text-primary">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function InfoRow(props: { icon: LucideIcon; label: string; value?: string }) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="grid min-h-12 grid-cols-[1.2rem_minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-2 px-3 py-2">
      <Icon className="size-4 text-primary/45" />
      <span className="truncate text-sm text-primary/55">{label}</span>
      <span className="break-words text-sm font-semibold text-primary/85">
        {value || '-'}
      </span>
    </div>
  );
}

function StatusPill(props: {
  icon: LucideIcon;
  label: string;
  tone?: 'muted' | 'success';
}) {
  const { icon: Icon, label, tone = 'muted' } = props;

  return (
    <span
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold',
        {
          'border-green-500/25 bg-green-500/10 text-green-300':
            tone === 'success',
          'bg-background/60 text-primary/70': tone === 'muted',
        },
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function DatabaseEngineGrid(props: { modules: DTOs.ModuleInstallationV1[] }) {
  const { modules } = props;

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-4 text-sm text-primary/55">
        No database module has been reported for this server yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {modules.map((module) => {
        const name = moduleDisplayName(module);
        return (
          <div
            key={module.id}
            className="flex min-w-0 items-center gap-3 rounded-lg border bg-card/40 px-3 py-2"
          >
            <img
              className="size-7 shrink-0 object-contain"
              src={resolveServerModuleLogo({ id: module.module_name })}
              alt=""
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary">{name}</p>
              <p className="truncate text-xs text-primary/50">
                {moduleVersion(module) || 'Default'} · {module.status}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DatabaseServiceList(props: { services: DTOs.ServiceOriginV1[] }) {
  const { services } = props;

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-4 text-sm text-primary/55">
        Database systemd services were not found in the latest scan.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="grid grid-cols-[minmax(0,1fr)_7rem] border-b px-3 py-2 text-xs font-bold text-primary/55">
        <span>Service</span>
        <span>Status</span>
      </div>
      {services.slice(0, 6).map((service) => (
        <div
          key={`${service.name}-${service.active}-${service.state}`}
          className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2 border-b px-3 py-2 last:border-b-0"
        >
          <span className="truncate text-sm font-medium text-primary/80">
            {service.name}
          </span>
          <StatusPill
            icon={
              service.active === 'active' ? CircleCheckIcon : CircleDashedIcon
            }
            label={service.active || service.state || 'unknown'}
            tone={service.active === 'active' ? 'success' : 'muted'}
          />
        </div>
      ))}
    </div>
  );
}

function InstalledServiceSummary(props: {
  modules: DTOs.ModuleInstallationV1[];
  onSelectInstallation: (selected: SelectedInstallation) => void;
}) {
  const { modules, onSelectInstallation } = props;
  const grouped = useMemo(() => groupModulesByCategory(modules), [modules]);

  if (modules.length === 0) {
    return (
      <p className="p-4 text-sm italic text-primary/55">
        No module inventory has been reported for this server.
      </p>
    );
  }

  return (
    <div className="grid gap-4 p-3 xl:grid-cols-2">
      {grouped.map((group) => (
        <div key={group.categoryId} className="min-w-0">
          <h4 className="mb-2 text-xs font-bold text-primary/55">
            {SERVER_MODULE_CATEGORY_LABELS.get(group.categoryId) ??
              titleizeModuleValue(group.categoryId)}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {group.modules.slice(0, 8).map((moduleGroup) => (
              <div
                key={moduleGroup.id}
                className="min-w-0 rounded-lg border bg-card/40 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    className="size-6 shrink-0 object-contain"
                    src={moduleGroup.logoUrl}
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary/85">
                      {moduleGroup.name}
                    </p>
                    <p className="truncate text-xs text-primary/50">
                      {moduleGroupStatusSummary(moduleGroup.installations)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {moduleGroup.installations.map((installation) => (
                    <button
                      key={installation.id}
                      type="button"
                      className={cn(
                        'inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-left text-xs font-semibold transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                        moduleStatusChipClass(installation.status),
                      )}
                      onClick={() =>
                        onSelectInstallation({
                          group: moduleGroup,
                          installation,
                        })
                      }
                    >
                      <span className="truncate">
                        {moduleInstanceLabel(installation)}
                      </span>
                      {installation.status !== 'installed' && (
                        <span className="shrink-0 text-[0.65rem] opacity-80">
                          ({installation.status || 'unknown'})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupModulesByCategory(modules: DTOs.ModuleInstallationV1[]) {
  const groups = new Map<
    string,
    { categoryId: string; modules: InstalledModuleGroup[] }
  >();
  const moduleGroups = new Map<string, InstalledModuleGroup>();

  for (const module of modules) {
    const moduleName = module.module_name || module.name;
    if (!moduleName) continue;

    const categoryId =
      getModuleInfoByFind({ id: moduleName })?.category[0] ?? 'utilities';

    const existing = moduleGroups.get(moduleName);
    if (existing) {
      existing.installations.push(module);
      continue;
    }

    moduleGroups.set(moduleName, {
      id: moduleName,
      categoryId,
      name: moduleDisplayName(module),
      logoUrl: resolveServerModuleLogo({ id: moduleName }),
      installations: [module],
    });
  }

  for (const moduleGroup of moduleGroups.values()) {
    moduleGroup.installations.sort(compareInstallations);
    const categoryGroup = groups.get(moduleGroup.categoryId) ?? {
      categoryId: moduleGroup.categoryId,
      modules: [],
    };
    categoryGroup.modules.push(moduleGroup);
    groups.set(moduleGroup.categoryId, categoryGroup);
  }

  return Array.from(groups.values())
    .sort((left, right) => {
      const leftIndex = SERVER_MODULES_CATEGORY.findIndex(
        (category) => category.id === left.categoryId,
      );
      const rightIndex = SERVER_MODULES_CATEGORY.findIndex(
        (category) => category.id === right.categoryId,
      );
      return normalizeSortIndex(leftIndex) - normalizeSortIndex(rightIndex);
    })
    .map((group) => ({
      ...group,
      modules: group.modules.sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    }));
}

type InstalledModuleGroup = {
  id: string;
  categoryId: string;
  name: string;
  logoUrl: string;
  installations: DTOs.ModuleInstallationV1[];
};

type SelectedInstallation = {
  group: InstalledModuleGroup;
  installation: DTOs.ModuleInstallationV1;
};

function compareInstallations(
  left: DTOs.ModuleInstallationV1,
  right: DTOs.ModuleInstallationV1,
) {
  return moduleInstanceLabel(left).localeCompare(moduleInstanceLabel(right));
}

function moduleGroupStatusSummary(modules: DTOs.ModuleInstallationV1[]) {
  const statusCounts = new Map<string, number>();

  for (const module of modules) {
    const status = module.status || 'unknown';
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  if (statusCounts.size === 1 && statusCounts.has('installed')) {
    return `${modules.length} installed ${modules.length === 1 ? 'instance' : 'instances'}`;
  }

  return Array.from(statusCounts.entries())
    .sort(([left], [right]) => {
      return moduleStatusSortIndex(left) - moduleStatusSortIndex(right);
    })
    .map(([status, count]) => `${count} ${status}`)
    .join(', ');
}

function moduleStatusSortIndex(status: string) {
  const priority = ['installing', 'progress', 'failed', 'installed', 'unknown'];
  const index = priority.indexOf(status);
  return index === -1 ? priority.length : index;
}

function moduleStatusChipClass(status?: string) {
  switch (status) {
    case 'installing':
    case 'progress':
      return 'border-blue-400/30 bg-blue-500/10 text-blue-300';
    case 'failed':
      return 'border-red-400/30 bg-red-500/10 text-red-300';
    case 'installed':
      return 'bg-background/60 text-primary/70';
    default:
      return 'bg-background/60 text-primary/55';
  }
}

function normalizeSortIndex(index: number) {
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function moduleDisplayName(module: DTOs.ModuleInstallationV1) {
  return (
    getModuleInfoByFind({ id: module.module_name })?.name ||
    module.display_name ||
    module.name ||
    module.module_name
  );
}

function moduleVersion(module: DTOs.ModuleInstallationV1) {
  const variables = module.variables ?? {};
  const directKeys = [
    `${module.module_name}_version`,
    module.module_name === 'go' ? 'golang_version' : '',
    module.module_name === 'nodejs' ? 'nodejs_version' : '',
    module.module_name === 'python' ? 'python_version' : '',
    module.module_name === 'ruby' ? 'ruby_version' : '',
    module.module_name === 'bun' ? 'bun_version' : '',
    module.module_name === 'php' ? 'php_version' : '',
    module.module_name === 'postgresql' ? 'postgresql_version' : '',
    module.module_name === 'mariadb' ? 'mariadb_use_official_repo_version' : '',
  ].filter(Boolean);

  for (const key of directKeys) {
    const value = variables[key];
    if (value != null && String(value).trim() !== '') return String(value);
  }

  for (const [key, value] of Object.entries(variables)) {
    if (key.endsWith('_version') && value != null && String(value).trim()) {
      return String(value);
    }
  }

  return '';
}

function moduleInstanceLabel(module: DTOs.ModuleInstallationV1) {
  const version = moduleVersion(module);
  if (version) return version;

  const key = module.installation_key || module.module_name;
  if (key && key !== module.module_name) return key;

  return 'Default';
}

function InstalledModuleDialog(props: {
  serverId: string;
  selected: SelectedInstallation | null;
  onDeleted: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { onDeleted, onOpenChange, selected, serverId } = props;
  const t = useDevetekTranslations('page.serverDetail.sectionModules');
  const { deleteInstallation, deletingInstallationId } =
    useModuleInstallationDelete();
  const isDeleting =
    deletingInstallationId != null &&
    deletingInstallationId === selected?.installation.id;
  const installationLabel = selected
    ? moduleInstanceLabel(selected.installation)
    : '';

  const handleClickUninstall = () => {
    if (!selected) return;

    deleteInstallation({
      installationId: selected.installation.id,
      moduleName: selected.group.name,
      onSuccess: onDeleted,
      serverId,
      versionLabel: installationLabel,
    });
  };

  return (
    <Dialog open={selected != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-2xl overflow-hidden p-0">
        {selected && (
          <div className="flex max-h-[calc(100svh-2rem)] min-h-0 flex-col">
            <DialogHeader className="shrink-0 border-b px-5 py-4">
              <DialogTitle className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-card">
                  <img
                    className="max-h-6 max-w-6 object-contain"
                    src={selected.group.logoUrl}
                    alt=""
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{selected.group.name}</span>
                  <span className="block text-xs font-medium text-primary/55">
                    {moduleInstanceLabel(selected.installation)}
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription>{t('detailDescription')}</DialogDescription>
            </DialogHeader>

            <div className="min-h-0 overflow-y-auto px-5 py-4">
              <div className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField
                  label="Status"
                  value={selected.installation.status}
                />
                <ReadOnlyField
                  label="Installation key"
                  value={selected.installation.installation_key}
                />
                <ReadOnlyField
                  label="Strategy"
                  value={selected.installation.install_strategy}
                />
                <ReadOnlyField
                  label="Inventory path"
                  value={selected.installation.inventory_path}
                />
                <ReadOnlyField
                  label="Playbook"
                  value={selected.installation.playbook_path}
                />
                <ReadOnlyField
                  label="Source"
                  value={[
                    selected.installation.module_source_owner,
                    selected.installation.module_source_repo,
                    selected.installation.module_source_ref,
                  ]
                    .filter(Boolean)
                    .join('/')}
                />
                <ReadOnlyField
                  label="Installed at"
                  value={formatDateTime(selected.installation.installed_at)}
                />
                <ReadOnlyField
                  label="Last observed"
                  value={formatDateTime(selected.installation.last_observed_at)}
                />
              </div>

              <div className="mt-5 rounded-xl border bg-card/40">
                <div className="border-b px-4 py-3">
                  <h6 className="text-sm font-bold text-primary">
                    Input variables
                  </h6>
                  <p className="mt-1 text-xs text-primary/55">
                    Captured from the install request and kept read-only.
                  </p>
                </div>
                <VariableList variables={selected.installation.variables} />
              </div>
            </div>

            <div className="shrink-0 border-t px-5 py-4">
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {t('uninstallPanel.title')}
                  </p>
                  <p className="mt-1 text-xs text-primary/55">
                    {t('uninstallPanel.description')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!selected.installation.id || isDeleting}
                  title={t('uninstallPanel.buttonTitle')}
                  aria-label={t('uninstallPanel.buttonAria', {
                    module: selected.group.name,
                    version: installationLabel,
                  })}
                  onClick={handleClickUninstall}
                >
                  <Trash2Icon className="size-4" />
                  {isDeleting
                    ? t('uninstallPanel.uninstalling')
                    : t('uninstallPanel.button')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyField(props: { label: string; value?: unknown }) {
  return (
    <div className="rounded-lg border bg-card/40 px-3 py-2">
      <p className="text-xs font-semibold text-primary/50">{props.label}</p>
      <p className="mt-1 break-words text-sm text-primary/85">
        {formatValue(props.value)}
      </p>
    </div>
  );
}

function VariableList(props: { variables?: Record<string, unknown> }) {
  const entries = Object.entries(props.variables ?? {});

  if (entries.length === 0) {
    return (
      <p className="px-4 py-4 text-sm italic text-primary/55">
        No input variables were captured for this installation.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="grid gap-2 px-4 py-3 md:grid-cols-[14rem_1fr]"
        >
          <p className="break-all text-xs font-semibold text-primary/60">
            {key}
          </p>
          <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-2 text-xs text-primary/80">
            {formatVariable(value)}
          </pre>
        </div>
      ))}
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatValue(value?: unknown) {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatVariable(value: unknown) {
  if (value == null || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function normalizeServiceName(value: string) {
  return value.replace(/^(●|\*)\s*/, '').toLowerCase();
}
