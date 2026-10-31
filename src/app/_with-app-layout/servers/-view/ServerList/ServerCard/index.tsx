import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useNavigate } from '@tanstack/react-router';
import {
  AppWindowIcon,
  BuildingIcon,
  CircleAlertIcon,
  Clock3Icon,
  CpuIcon,
  DatabaseIcon,
  HardDriveIcon,
  HardHatIcon,
  KeyRoundIcon,
  Layers3Icon,
  MemoryStickIcon,
  NetworkIcon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { serverDisplayName } from '@/entities/server/lib/describeServer';
import { getServerErrorSummary } from '@/entities/server/lib/error-detail';
import { ServerCreator } from '@/entities/server/ui/ServerCreator';
import { ServerErrorDialog } from '@/entities/server/ui/ServerErrorDialog';
import { ServerIdentity } from '@/entities/server/ui/ServerIdentity';
import { ServerStatusPill } from '@/entities/server/ui/ServerStatusPill';
import {
  DATABASE_MODULE_IDS,
  groupModules,
  moduleInstanceLabel,
} from '@/entities/server-modules/lib/installations';
import type { OverviewModuleGroup } from '@/entities/server-modules/lib/installations';
import { POLL_INTERVAL_MS__SERVER_CARD } from '@/entities/server-statistics/config';

import { ApiLoadBalancer, ApiServer } from '@/shared/api';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { ServerActions } from '../ServerActions';

import {
  formatDataSize,
  formatDecimal,
  joinCompact,
  sanitizePercent,
} from './metrics';
import type { ServerCardProps } from './types';

/**
 * The rich row of the list: identity and status, what runs on the server,
 * live usage from the agent, and every action. Each card polls the agent
 * itself, so the page size stays small.
 */
export default function ServerCard(props: ServerCardProps) {
  const { applicationCount = 0, handlers, server } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const navigate = useNavigate();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const status = server.state.status;
  const lastUpdated = getDistanceFromNow(server.timestamp.updated, locale);
  const shouldFetchOverview = Boolean(server.id);
  const shouldFetchLiveStats = status === 'ready' && Boolean(server.id);

  const [moduleInventoryResponse] = ApiServer.Modules.$Id.useGet({
    serverId: server.id,
    options: { skip: !shouldFetchOverview },
  });

  const [loadBalancersResponse] = ApiLoadBalancer.Find.useGet({
    machineId: server.id,
    page: 1,
    limit: 1,
    options: { skip: !shouldFetchOverview },
  });

  const [cpuUsageResponse] = ApiServer.Origin.$Id.Cpu.Usage.useGet({
    serverId: server.id,
    options: {
      skip: !shouldFetchLiveStats,
      refreshIntervalMs: POLL_INTERVAL_MS__SERVER_CARD,
    },
  });

  const [memoryUsageResponse] = ApiServer.Origin.$Id.Memory.Usage.useGet({
    serverId: server.id,
    options: {
      skip: !shouldFetchLiveStats,
      refreshIntervalMs: POLL_INTERVAL_MS__SERVER_CARD,
    },
  });

  const [diskUsageResponse] = ApiServer.Origin.$Id.Disk.Usage.useGet({
    serverId: server.id,
    options: {
      skip: !shouldFetchLiveStats,
      refreshIntervalMs: POLL_INTERVAL_MS__SERVER_CARD,
    },
  });

  const moduleInventoryData = responseData(moduleInventoryResponse);
  const loadBalancerData = responseData(loadBalancersResponse);
  const cpuUsageData = responseData(cpuUsageResponse);
  const memoryUsageData = responseData(memoryUsageResponse);
  const diskUsageData = responseData(diskUsageResponse);

  const overview = useMemo(() => {
    const modules = moduleInventoryData?.modules ?? [];
    const installedModules = modules.filter(
      (module) => module.status === 'installed',
    );

    return {
      moduleGroups: groupModules(modules),
      installedCount: installedModules.length,
      databaseCount: installedModules.filter((module) =>
        DATABASE_MODULE_IDS.has(module.module_name),
      ).length,
      loadBalancerCount:
        loadBalancerData?.pagination.total_item ??
        loadBalancerData?.routers?.length ??
        0,
      cpuPercent: sanitizePercent(cpuUsageData?.cpu_usage),
      memoryPercent: sanitizePercent(memoryUsageData?.used_percent),
      diskPercent: sanitizePercent(
        diskUsageData?.total
          ? (diskUsageData.used / diskUsageData.total) * 100
          : undefined,
      ),
      memoryDetail: joinCompact([
        formatDataSize(memoryUsageData?.used),
        formatDataSize(memoryUsageData?.total),
      ]),
      diskDetail: joinCompact([
        formatDataSize(diskUsageData?.used),
        formatDataSize(diskUsageData?.total),
      ]),
    };
  }, [
    cpuUsageData,
    diskUsageData,
    loadBalancerData,
    memoryUsageData,
    moduleInventoryData,
  ]);

  const goTo = (
    event: MouseEvent<HTMLButtonElement>,
    to: '/applications' | '/backend/load-balancers' | '/servers/$id',
  ) => {
    event.stopPropagation();
    if (to === '/servers/$id') {
      navigate({ to, params: { id: server.id } });
      return;
    }
    navigate({ to });
  };

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card p-4 transition-colors hover:border-sky-400/40',
        status === 'failed' && 'border-red-400/40',
        status === 'progress' && 'border-sky-400/40',
        status === 'deleting' && 'border-dashed border-amber-400/50',
      )}
    >
      {status === 'progress' && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(56,189,248,0.10),transparent_60%)]" />
      )}

      <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="grid min-w-0 content-start gap-3">
          <ServerIdentity
            server={server}
            size="lg"
            meta
            onClickName={handlers.openDetails}
            trailing={
              <ServerStatusPill
                state={server.state}
                onClick={handlers.showStatus}
              />
            }
          />

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              size="sm"
              icon={AppWindowIcon}
              label={t('page.servers.card.applications')}
              value={applicationCount}
              onClick={(event) => goTo(event, '/applications')}
            />
            <StatTile
              size="sm"
              icon={NetworkIcon}
              label={t('page.servers.card.loadBalancers')}
              value={overview.loadBalancerCount}
              onClick={(event) => goTo(event, '/backend/load-balancers')}
            />
            <StatTile
              size="sm"
              icon={DatabaseIcon}
              label={t('page.servers.card.databases')}
              value={overview.databaseCount}
              onClick={(event) => goTo(event, '/servers/$id')}
            />
            <StatTile
              size="sm"
              icon={Layers3Icon}
              label={t('page.servers.card.modules')}
              value={overview.installedCount}
              onClick={(event) => goTo(event, '/servers/$id')}
            />
          </div>

          {status === 'failed' && (
            <ErrorSummaryBanner
              message={getServerErrorSummary(server.state)}
              onClickDetail={(event) => {
                event.stopPropagation();
                setIsErrorDialogOpen(true);
              }}
            />
          )}

          <ModuleStrip modules={overview.moduleGroups} />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
            {server.ownership.team ? (
              <InlineInfo icon={BuildingIcon} value={server.ownership.team} />
            ) : (
              !server.creator && (
                <InlineInfo icon={UserIcon} value={server.ownership.owner} />
              )
            )}
            <ServerCreator creator={server.creator} />
            <InlineInfo
              icon={KeyRoundIcon}
              value={
                server.ssh.defaultUser
                  ? `${server.ssh.defaultUser}@${server.ssh.port || '-'}`
                  : undefined
              }
            />
            <InlineInfo
              icon={HardHatIcon}
              value={
                server.agent.version
                  ? t('page.servers.card.agent', {
                      version: server.agent.version,
                    })
                  : undefined
              }
            />
            <InlineInfo icon={Clock3Icon} value={lastUpdated} />
          </div>
        </div>

        <div className="grid content-between gap-3">
          {status === 'ready' ? (
            <div className="grid gap-2 rounded-xl border bg-background/50 p-3">
              <HealthBar
                icon={CpuIcon}
                label={t('page.servers.card.cpu')}
                percent={overview.cpuPercent}
              />
              <HealthBar
                icon={MemoryStickIcon}
                label={t('page.servers.card.memory')}
                percent={overview.memoryPercent}
                detail={overview.memoryDetail}
              />
              <HealthBar
                icon={HardDriveIcon}
                label={t('page.servers.card.disk')}
                percent={overview.diskPercent}
                detail={overview.diskDetail}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed bg-background/30 p-3 text-xs text-muted-foreground">
              <CpuIcon className="size-4 shrink-0" />
              {t('page.servers.card.liveStatsWhenReady')}
            </div>
          )}

          <ServerActions handlers={handlers} layout="icons" />
        </div>
      </div>

      <ServerErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        serverName={serverDisplayName(server)}
        state={server.state}
      />
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

function ErrorSummaryBanner(props: {
  message?: string;
  onClickDetail: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { message, onClickDetail } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-300" />
        <div className="min-w-0">
          <p className="font-bold text-red-700 dark:text-red-200">
            {t('page.servers.card.setupFailed')}
          </p>
          <p className="mt-0.5 line-clamp-2 break-words text-red-700/80 dark:text-red-100/75">
            {message || t('page.servers.card.noErrorDetail')}
          </p>
        </div>
      </div>

      <Button
        buttonStyle="outline"
        buttonColor="secondary"
        size="sm"
        className="shrink-0 border-red-400/30 text-red-700 hover:bg-red-500/15 dark:text-red-100"
        onClick={onClickDetail}
      >
        {t('page.servers.card.viewDetail')}
      </Button>
    </div>
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

function ModuleStrip(props: { modules: OverviewModuleGroup[] }) {
  const { modules } = props;
  const t = useDevetekTranslations();

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-3 py-2 text-xs font-medium text-muted-foreground">
        {t('page.servers.card.noModules')}
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
          <span className="text-muted-foreground">
            {module.installations.length > 1
              ? `${module.installations.length}x`
              : moduleInstanceLabel(module.installations[0])}
          </span>
        </span>
      ))}
      {modules.length > 8 && (
        <span className="inline-flex items-center rounded-full border border-dashed px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {t('page.servers.card.more', { count: modules.length - 8 })}
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
    <div className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          {detail && (
            <span className="truncate text-muted-foreground/70">
              · {detail}
            </span>
          )}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/60">
          <div
            className={cn('h-full rounded-full transition-all', {
              'bg-primary/20': percent == null,
              'bg-emerald-500': percent != null && percent < 70,
              'bg-amber-500': percent != null && percent >= 70 && percent < 90,
              'bg-red-500': percent != null && percent >= 90,
            })}
            style={{ width: `${percent ?? 8}%` }}
          />
        </div>
      </div>
      <span className="text-right text-xs font-bold text-primary/80">
        {displayPercent}
      </span>
    </div>
  );
}
