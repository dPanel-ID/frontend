import { useMemo } from 'react';
import type { ElementType, MouseEvent } from 'react';

import { useNavigate, useRouter } from '@tanstack/react-router';
import {
  AppWindowIcon,
  AppWindowMacIcon,
  BuildingIcon,
  Clock3Icon,
  CloudIcon,
  CpuIcon,
  DatabaseIcon,
  EyeIcon,
  GlobeIcon,
  HardDriveIcon,
  HardHatIcon,
  HomeIcon,
  KeyIcon,
  Layers3Icon,
  MemoryStickIcon,
  NetworkIcon,
  PencilIcon,
  RotateCcwIcon,
  Trash2Icon,
  UserCheck2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { SERVER_PROVIDER_METADATA } from '@/entities/server/ui/constants/provider-metadata';
import { SERVER_STATE_METADATA } from '@/entities/server/ui/constants/state-metadata';
import { resolveServerModuleLogo } from '@/entities/server-modules/config/registry';
import { getModuleInfoByFind } from '@/entities/server-modules/model/getModuleInfo';

import { ApiLoadBalancer, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { iife } from '@/shared/libs/browser/fn';
import { cn } from '@/shared/libs/tailwind/cn';
import IconEye from '@/shared/presentation/icons/Eye';
import IconEyeActive from '@/shared/presentation/icons/EyeActive';
import IconLastDateActive from '@/shared/presentation/icons/LastDateActive';
import { ResourceCard } from '@/widgets/resource-card';

import type { ServerCardProps } from './types';

const DATABASE_MODULE_IDS = new Set([
  'mariadb',
  'mongodb',
  'mysql',
  'postgresql',
  'redis',
]);

export default function ServerCard(props: ServerCardProps) {
  const {
    variant,
    data,
    applicationCount = 0,

    onClickEdit,
    onClickStatus,
    onClickMigrateOwnership,
    onClickDelete,
    onClickReinstall,
  } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const navigate = useNavigate();
  const router = useRouter();

  const lastUpdated = getDistanceFromNow(data.timestamp.updated, locale);

  const detailsHref = router.buildLocation({
    to: '/servers/$id',
    params: { id: data.id },
  }).href;
  const isFullOverview = variant === 'full';
  const shouldFetchOverview = isFullOverview && Boolean(data.id);
  const shouldFetchLiveStats =
    isFullOverview && data.state.status === 'ready' && Boolean(data.id);

  const [moduleInventoryResponse] = ApiServer.Modules.$Id.useGet({
    serverId: data.id,
    options: {
      skip: !shouldFetchOverview,
    },
  });

  const [loadBalancersResponse] = ApiLoadBalancer.Find.useGet({
    machineId: data.id,
    page: 1,
    limit: 100,
    options: {
      skip: !shouldFetchOverview,
    },
  });

  const [cpuUsageResponse] = ApiServer.Origin.$Id.Cpu.Usage.useGet({
    serverId: data.id,
    options: {
      skip: !shouldFetchLiveStats,
    },
  });

  const [memoryUsageResponse] = ApiServer.Origin.$Id.Memory.Usage.useGet({
    serverId: data.id,
    options: {
      skip: !shouldFetchLiveStats,
    },
  });

  const [diskUsageResponse] = ApiServer.Origin.$Id.Disk.Usage.useGet({
    serverId: data.id,
    options: {
      skip: !shouldFetchLiveStats,
    },
  });

  const moduleInventoryData = responseData(moduleInventoryResponse);
  const loadBalancerData = responseData(loadBalancersResponse);
  const cpuUsageData = responseData(cpuUsageResponse);
  const memoryUsageData = responseData(memoryUsageResponse);
  const diskUsageData = responseData(diskUsageResponse);

  const cnCardWrapper = cn({
    'border-red-500': data.state.status === 'failed',
    'border-orange-500 border-dashed': data.state.status === 'deleting',
    'border-cyan-500 border-dashed': data.state.status === 'progress',
  });

  const serverStateMetadata = SERVER_STATE_METADATA[data.state.status];

  const isAnomalousStatus = data.state.status !== 'ready';
  const statusBadgeColorClass = isAnomalousStatus
    ? `text-[var(${serverStateMetadata.color})]`
    : undefined;

  const { imageSrc: serverIconSrc } =
    SERVER_PROVIDER_METADATA[data.cloud?.provider ?? 'other'];

  const systemInfo = iife(() => {
    if (data.system.name && data.system.version) {
      return `${data.system.name}-${data.system.version}`;
    }

    if (data.system.name) {
      return data.system.name;
    }
  });

  const overview = useMemo(() => {
    const modules = moduleInventoryData?.modules ?? [];
    const moduleGroups = groupModules(modules);
    const installedModules = modules.filter(
      (module) => module.status === 'installed',
    );
    const databaseModules = installedModules.filter((module) =>
      DATABASE_MODULE_IDS.has(module.module_name),
    );

    return {
      modules,
      moduleGroups,
      installedModules,
      databaseModules,
      loadBalancers: loadBalancerData?.routers ?? [],
      cpuPercent: sanitizePercent(cpuUsageData?.cpu_usage),
      memoryPercent: sanitizePercent(memoryUsageData?.used_percent),
      diskPercent: sanitizePercent(
        diskUsageData?.total
          ? (diskUsageData.used / diskUsageData.total) * 100
          : undefined,
      ),
      memoryUsed: formatDataSize(memoryUsageData?.used),
      memoryTotal: formatDataSize(memoryUsageData?.total),
      diskUsed: formatDataSize(diskUsageData?.used),
      diskTotal: formatDataSize(diskUsageData?.total),
    };
  }, [
    cpuUsageData,
    diskUsageData,
    loadBalancerData,
    memoryUsageData,
    moduleInventoryData,
  ]);

  const actions = [
    {
      label: t('common.actions.details'),
      icon: IconEye,
      iconActive: IconEyeActive,
      href: detailsHref,
    },
    data.state.status !== 'progress' && {
      label: t('common.actions.reinstall'),
      onClick: onClickReinstall,
    },
    data.state.status !== 'progress' &&
      !!onClickEdit && {
        label: t('common.actions.edit'),
        onClick: onClickEdit,
      },
    !!onClickMigrateOwnership && {
      label: t('common.actions.migrateOwnership'),
      onClick: onClickMigrateOwnership,
    },
    !!onClickDelete && {
      variant: 'destructive' as const,
      label: t('common.actions.delete'),
      onClick: onClickDelete,
    },
  ];

  if (variant === 'compact') {
    return (
      <ResourceCard.Compact
        classNameCardWrapper={cnCardWrapper}
        onClickBody={
          data.host.name
            ? () => navigate({ to: '/servers/$id', params: { id: data.id } })
            : undefined
        }
      >
        <ResourceCard.Compact.Main>
          <ResourceCard.Compact.Main.Hero
            image={serverIconSrc}
            badge={isAnomalousStatus ? serverStateMetadata.icon : undefined}
            badgeTooltipMessage={
              isAnomalousStatus
                ? t(serverStateMetadata.i18n.statusLabel)
                : undefined
            }
            classNameBadge={statusBadgeColorClass}
          />
          <ResourceCard.Compact.Main.Content
            title={data.host.name}
            status={[
              !!data.ownership.team && {
                icon: BuildingIcon,
                text: data.ownership.team,
              },
              {
                icon: UserIcon,
                text: data.ownership.owner,
              },
            ]}
          />
        </ResourceCard.Compact.Main>

        <ResourceCard.Compact.TertiaryInfos
          infos={[
            {
              icon: UserCheck2Icon,
              infoLabel: t('common.terms.sshDefaultUser'),
              value: data.ssh.defaultUser,
            },
            {
              icon: HardHatIcon,
              infoLabel: t('common.terms.agent'),
              value: data.agent.version,
            },
            {
              icon: AppWindowMacIcon,
              infoLabel: t('common.terms.system'),
              value: systemInfo,
            },
          ]}
        />

        <ResourceCard.Compact.SecondaryInfos
          infos={[
            {
              icon: HomeIcon,
              infoLabel: t('common.terms.address'),
              value: data.host.address,
            },
            {
              icon: KeyIcon,
              infoLabel: t('common.terms.sshPort'),
              value: String(data.ssh.port),
            },
          ]}
        />

        <ResourceCard.Compact.Actions
          visibleActionOnlyIcon
          labelMore={t('common.actions.more')}
          actions={actions}
        />

        <ResourceCard.Compact.Footnote>
          <ResourceCard.Compact.Footnote.Item
            icon={serverStateMetadata.icon}
            label={t('common.terms.status')}
            value={t(serverStateMetadata.i18n.statusLabel)}
            onClick={onClickStatus}
            style={{
              wrapper: {
                color: `var(${serverStateMetadata.color})`,
              },
            }}
          />
          <ResourceCard.Compact.Footnote.Spacer />
          <ResourceCard.Compact.Footnote.Item
            icon={IconLastDateActive}
            label={t('common.terms.lastUpdated')}
            value={lastUpdated}
          />
        </ResourceCard.Compact.Footnote>
      </ResourceCard.Compact>
    );
  }

  const handleOpenDetails = () => {
    navigate({ to: '/servers/$id', params: { id: data.id } });
  };

  const handleNavigate = (
    event: MouseEvent<HTMLButtonElement>,
    to: '/applications' | '/backend/load-balancers' | '/servers/$id',
  ) => {
    event.stopPropagation();
    if (to === '/servers/$id') {
      navigate({ to, params: { id: data.id } });
      return;
    }
    navigate({ to });
  };

  return (
    <article
      className={cn(
        'group rounded-lg border bg-card/45 p-4 transition-colors hover:border-primary/25 hover:bg-card/65',
        cnCardWrapper,
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid min-w-0 gap-3">
          <button
            type="button"
            className="flex min-w-0 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            onClick={handleOpenDetails}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/75">
              <img
                src={serverIconSrc}
                alt=""
                className="max-h-8 max-w-8 object-contain"
              />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold leading-tight text-primary">
                  {data.host.name || data.host.address || `Server ${data.id}`}
                </h3>
                <StatusInline
                  icon={serverStateMetadata.icon}
                  label={t(serverStateMetadata.i18n.statusLabel)}
                  color={`var(${serverStateMetadata.color})`}
                />
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/55">
                <InlineInfo icon={GlobeIcon} value={data.host.address} />
                <InlineInfo
                  icon={KeyIcon}
                  value={`SSH :${data.ssh.port || '-'}`}
                />
                <InlineInfo icon={HardHatIcon} value={data.agent.version} />
                <InlineInfo
                  icon={CloudIcon}
                  value={data.cloud?.provider || 'other'}
                />
                {systemInfo && (
                  <InlineInfo icon={AppWindowMacIcon} value={systemInfo} />
                )}
              </div>
            </div>
          </button>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewMetric
              icon={AppWindowIcon}
              label="Applications"
              value={applicationCount}
              onClick={(event) => handleNavigate(event, '/applications')}
            />
            <OverviewMetric
              icon={NetworkIcon}
              label="Load Balancers"
              value={overview.loadBalancers.length}
              onClick={(event) =>
                handleNavigate(event, '/backend/load-balancers')
              }
            />
            <OverviewMetric
              icon={DatabaseIcon}
              label="Databases"
              value={overview.databaseModules.length}
              onClick={(event) => handleNavigate(event, '/servers/$id')}
            />
            <OverviewMetric
              icon={Layers3Icon}
              label="Modules"
              value={overview.installedModules.length}
              onClick={(event) => handleNavigate(event, '/servers/$id')}
            />
          </div>

          <ModuleStrip modules={overview.moduleGroups} />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/45">
            <InlineInfo
              icon={UserIcon}
              value={data.ownership.team || data.ownership.owner}
            />
            <InlineInfo icon={Clock3Icon} value={lastUpdated} />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <HealthBar
              icon={CpuIcon}
              label="CPU Load"
              percent={overview.cpuPercent}
            />
            <HealthBar
              icon={MemoryStickIcon}
              label="Memory"
              percent={overview.memoryPercent}
              detail={joinCompact([overview.memoryUsed, overview.memoryTotal])}
            />
            <HealthBar
              icon={HardDriveIcon}
              label="Disk"
              percent={overview.diskPercent}
              detail={joinCompact([overview.diskUsed, overview.diskTotal])}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <ActionIcon
              icon={EyeIcon}
              title={t('common.actions.details')}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDetails();
              }}
            />
            {!!onClickReinstall && data.state.status !== 'progress' && (
              <ActionIcon
                icon={RotateCcwIcon}
                title={t('common.actions.reinstall')}
                onClick={(event) => {
                  event.stopPropagation();
                  onClickReinstall();
                }}
              />
            )}
            {!!onClickEdit && data.state.status !== 'progress' && (
              <ActionIcon
                icon={PencilIcon}
                title={t('common.actions.edit')}
                onClick={(event) => {
                  event.stopPropagation();
                  onClickEdit();
                }}
              />
            )}
            {!!onClickMigrateOwnership && (
              <ActionIcon
                icon={BuildingIcon}
                title={t('common.actions.migrateOwnership')}
                onClick={(event) => {
                  event.stopPropagation();
                  onClickMigrateOwnership();
                }}
              />
            )}
            {!!onClickDelete && (
              <ActionIcon
                icon={Trash2Icon}
                title={t('common.actions.delete')}
                tone="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onClickDelete();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}

function StatusInline(props: {
  icon: ElementType<{ className?: string }>;
  label: string;
  color: string;
}) {
  const { icon: Icon, label, color } = props;

  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 rounded-full border bg-background/60 px-2 text-xs font-bold"
      style={{ color }}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function InlineInfo(props: { icon: LucideIcon; value?: string }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}

function OverviewMetric(props: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { icon: Icon, label, value, onClick } = props;

  return (
    <button
      type="button"
      className="flex min-w-0 items-center gap-2 rounded-lg border bg-background/45 px-3 py-2 text-left transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      onClick={onClick}
    >
      <Icon className="size-4 shrink-0 text-primary/55" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold leading-tight text-primary/90">
          {value}
        </span>
        <span className="block truncate text-[0.7rem] font-semibold text-primary/45">
          {label}
        </span>
      </span>
    </button>
  );
}

function ModuleStrip(props: { modules: OverviewModuleGroup[] }) {
  const { modules } = props;

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-2 text-xs font-medium text-primary/45">
        No installed module inventory has been reported yet.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {modules.slice(0, 8).map((module) => (
        <span
          key={module.id}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-xs font-bold text-primary/70"
        >
          <img
            src={module.logoUrl}
            alt=""
            className="size-4 shrink-0 object-contain"
          />
          <span className="truncate">{module.name}</span>
          <span className="text-primary/45">
            {module.installations.length > 1
              ? `${module.installations.length}x`
              : moduleInstanceLabel(module.installations[0])}
          </span>
        </span>
      ))}
      {modules.length > 8 && (
        <span className="inline-flex items-center rounded-full border border-dashed px-2.5 py-1 text-xs font-bold text-primary/45">
          +{modules.length - 8} more
        </span>
      )}
    </div>
  );
}

function HealthBar(props: {
  icon: LucideIcon;
  label: string;
  percent?: number;
  detail?: string;
}) {
  const { icon: Icon, label, percent, detail } = props;
  const displayPercent =
    percent == null ? '-' : `${formatDecimal(percent, percent >= 10 ? 0 : 1)}%`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-primary/55">
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          {detail && (
            <span className="truncate text-primary/35">· {detail}</span>
          )}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
          <div
            className={cn('h-full rounded-full transition-all', {
              'bg-primary/25': percent == null,
              'bg-green-400': percent != null && percent < 70,
              'bg-amber-400': percent != null && percent >= 70 && percent < 90,
              'bg-red-400': percent != null && percent >= 90,
            })}
            style={{ width: `${percent ?? 8}%` }}
          />
        </div>
      </div>
      <span className="text-right text-xs font-bold text-primary/75">
        {displayPercent}
      </span>
    </div>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  tone?: 'default' | 'danger';
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { icon: Icon, title, tone = 'default', onClick } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border bg-background/50 transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        {
          'text-primary/65 hover:text-primary': tone === 'default',
          'text-red-300 hover:border-red-400/40 hover:bg-red-500/10':
            tone === 'danger',
        },
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  );
}

type OverviewModuleGroup = {
  id: string;
  name: string;
  logoUrl: string;
  installations: DTOs.ModuleInstallationV1[];
};

function groupModules(modules: DTOs.ModuleInstallationV1[]) {
  const groups = new Map<string, OverviewModuleGroup>();

  for (const module of modules) {
    const moduleName = module.module_name || module.name;
    if (!moduleName) continue;

    const existing = groups.get(moduleName);
    if (existing) {
      existing.installations.push(module);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      name: moduleDisplayName(module),
      logoUrl: resolveServerModuleLogo({ id: moduleName }),
      installations: [module],
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

function moduleDisplayName(module: DTOs.ModuleInstallationV1) {
  return (
    getModuleInfoByFind({ id: module.module_name })?.name ||
    module.display_name ||
    module.name ||
    module.module_name
  );
}

function moduleVersion(module?: DTOs.ModuleInstallationV1) {
  if (!module) return '';

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

function moduleInstanceLabel(module?: DTOs.ModuleInstallationV1) {
  if (!module) return 'Default';

  const version = moduleVersion(module);
  if (version) return version;

  const key = module.installation_key || module.module_name;
  if (key && key !== module.module_name) return key;

  return module.status && module.status !== 'installed'
    ? module.status
    : 'Default';
}

function sanitizePercent(value?: number) {
  if (value == null || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, value));
}

function formatDecimal(value: number, precision: number) {
  const rounded = Number(value.toFixed(precision));
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(precision);
}

function formatDataSize(value?: number) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let normalized = value;

  while (normalized >= 1024 && unitIndex < units.length - 1) {
    normalized /= 1024;
    unitIndex += 1;
  }

  return `${formatDecimal(normalized, normalized >= 10 ? 1 : 2)} ${
    units[unitIndex]
  }`;
}

function joinCompact(values: string[]) {
  const cleaned = values.filter(Boolean);
  if (cleaned.length === 0) return '';
  return cleaned.join(' / ');
}
