import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { Link, useNavigate, useParams } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  AppWindowIcon,
  BuildingIcon,
  CalendarIcon,
  CloudIcon,
  DatabaseIcon,
  GlobeIcon,
  HardHatIcon,
  HouseIcon,
  KeyRoundIcon,
  Layers3Icon,
  NetworkIcon,
  PuzzleIcon,
  ServerIcon,
  TerminalIcon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import {
  isAgentCloudServer,
  isCloudServer,
  isPrivateServer,
  serverProviderLabel,
  serverSystemLabel,
} from '@/entities/server/lib/describeServer';
import { ServerCreator } from '@/entities/server/ui/ServerCreator';
import {
  DATABASE_MODULE_IDS,
  groupModules,
  moduleInstanceLabel,
} from '@/entities/server-modules/lib/installations';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { ApiApplication, ApiLoadBalancer } from '@/shared/api';
import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { servicesNeedingAttention } from '../../../-lib/module-health';
import { useSubscribe } from '../../../-model/events';
import { useServerDataModel } from '../../../-model/server-data';
import { useModuleHealth } from '../../../-usecase/module-health';

import LiveUsage from './LiveUsage';

export default function OverviewTab() {
  const t = useDevetekTranslations('page.serverDetail.overview');
  const locale = useDevetekLocale();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/_with-app-layout/servers/$id/' });
  const [serverId, detail, modulesState] = useServerDataModel((s) => [
    String(s.serverId),
    s.detail,
    s.modules,
  ]);

  const moduleHealth = useModuleHealth(serverId);
  const server = responseData(detail);
  const isPrivate = !!server && isPrivateServer(server);

  const [applicationsResponse, refreshApplications] =
    ApiApplication.Find.useGet({
      page: 1,
      limit: 12,
      options: { skip: !server },
    });

  const [loadBalancersResponse, refreshLoadBalancers] =
    ApiLoadBalancer.Find.useGet({
      machineId: serverId,
      page: 1,
      limit: 1,
      options: { skip: !server },
    });

  useSubscribe('@servers::detail/server-services-refresh', () => {
    refreshApplications();
    refreshLoadBalancers();
  });

  const applicationsData = responseData(applicationsResponse);
  const loadBalancersData = responseData(loadBalancersResponse);
  const modulesData = responseData(modulesState);

  const overview = useMemo(() => {
    const applications = applicationsData?.applications ?? [];
    const modules = modulesData?.modules ?? [];

    const deployed = applications.filter((application) =>
      application.deploys?.some(
        (deployment) => String(deployment.machine_id) === serverId,
      ),
    );
    const running = deployed.filter((application) =>
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
    const installed = modules.filter((module) => module.status === 'installed');

    return {
      applications: deployed.length,
      runningApplications: running.length,
      loadBalancers:
        loadBalancersData?.pagination.total_item ??
        loadBalancersData?.routers?.length ??
        0,
      databases: installed.filter((module) =>
        DATABASE_MODULE_IDS.has(module.module_name),
      ).length,
      installedModules: installed.length,
      trackedModules: modules.length,
      moduleGroups: groupModules(modules),
    };
  }, [applicationsData, loadBalancersData, modulesData, serverId]);

  const goToModules = () =>
    navigate({
      to: '/servers/$id',
      params: { id },
      search: { tab: 'modules' },
    });

  return (
    <div className="grid gap-4">
      <LiveUsage />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={AppWindowIcon}
          tone="sky"
          label={t('applications')}
          value={overview.applications}
          hint={t('applicationsHint', {
            running: overview.runningApplications,
          })}
          onClick={() => navigate({ to: '/applications' })}
        />
        <StatTile
          icon={NetworkIcon}
          tone="sky"
          label={t('loadBalancers')}
          value={overview.loadBalancers}
          onClick={() =>
            navigate({
              to: '/backend/load-balancers',
              search: { page: 1, viewMode: 'table' },
            })
          }
        />
        <StatTile
          icon={DatabaseIcon}
          tone="amber"
          label={t('databases')}
          value={overview.databases}
          onClick={goToModules}
        />
        <StatTile
          icon={Layers3Icon}
          tone="emerald"
          label={t('modules')}
          value={overview.installedModules}
          hint={t('modulesHint', { tracked: overview.trackedModules })}
          onClick={goToModules}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={ServerIcon} title={t('details')}>
          <dl className="divide-y">
            <Row
              icon={isPrivate ? HouseIcon : GlobeIcon}
              label={isPrivate ? t('lanAddress') : t('address')}
              value={
                isPrivate
                  ? server.host.address || t('lanAddressUnknown')
                  : server?.host.address
              }
              mono={!isPrivate || !!server.host.address}
            />
            {isPrivate && (
              <Row
                icon={GlobeIcon}
                label={t('publicAddress')}
                help={t('publicAddressHelp')}
                value={server.host.publicAddress ?? t('publicAddressUnknown')}
                mono={!!server.host.publicAddress}
              />
            )}
            {isPrivate ? (
              <Row
                icon={KeyRoundIcon}
                label={t('connection')}
                value={
                  isAgentCloudServer(server)
                    ? t('connectionAgent')
                    : t('connectionPrivate')
                }
              />
            ) : (
              <Row
                icon={KeyRoundIcon}
                label={t('ssh')}
                value={
                  server
                    ? `${server.ssh.defaultUser || 'root'}@${server.host.address || '-'}:${server.ssh.port || 22}`
                    : undefined
                }
                mono
              />
            )}
            <Row
              icon={TerminalIcon}
              label={t('system')}
              value={server ? serverSystemLabel(server) : undefined}
            />
            <Row
              icon={HardHatIcon}
              label={t('agent')}
              value={server?.agent.version}
            />
            <Row
              icon={CloudIcon}
              label={t('provider')}
              value={
                server
                  ? isCloudServer(server)
                    ? [serverProviderLabel(server), server.cloud?.region]
                        .filter(Boolean)
                        .join(' · ')
                    : t('ownServer')
                  : undefined
              }
            />
            <Row
              icon={server?.ownership.team ? BuildingIcon : UserIcon}
              label={t('ownership')}
              value={
                server && <OwnerLink ownership={server.ownership} preferTeam />
              }
            />
            <Row
              icon={UserIcon}
              label={t('createdBy')}
              value={
                server?.creator && (
                  <ServerCreator creator={server.creator} nameOnly />
                )
              }
            />
            <Row
              icon={CalendarIcon}
              label={t('added')}
              value={server?.timestamp.created.toLocaleDateString(locale, {
                dateStyle: 'medium',
              })}
            />
          </dl>
        </Section>

        <Section
          icon={PuzzleIcon}
          title={t('runsHere')}
          description={t('runsHereHint')}
          action={
            <Link
              to="/servers/$id"
              params={{ id }}
              search={{ tab: 'modules' }}
              className="text-sm font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-sky-300"
            >
              {t('manageModules')}
            </Link>
          }
        >
          {overview.moduleGroups.length === 0 ? (
            <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
              {t('noModules')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {overview.moduleGroups.slice(0, 12).map((group) => {
                const down = group.installations.flatMap((installation) =>
                  installation.status === 'installed'
                    ? servicesNeedingAttention(moduleHealth, installation.id)
                    : [],
                );
                return (
                  <span
                    key={group.id}
                    title={
                      down.length > 0
                        ? t('serviceNotRunning', {
                            units: down
                              .map((service) => service.unit)
                              .join(', '),
                          })
                        : undefined
                    }
                    className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${down.length > 0 ? 'border-red-400/50 bg-red-500/5' : 'bg-background/60'}`}
                  >
                    {down.length > 0 ? (
                      <AlertTriangleIcon className="size-4 shrink-0 text-red-600 dark:text-red-300" />
                    ) : (
                      <img
                        src={group.logoUrl}
                        alt=""
                        className="size-4 shrink-0 object-contain"
                      />
                    )}
                    <span className="truncate">{group.name}</span>
                    <span className="text-muted-foreground">
                      {group.installations.length > 1
                        ? `${group.installations.length}x`
                        : moduleInstanceLabel(group.installations[0])}
                    </span>
                    {down.length > 0 && (
                      <span className="text-xs font-medium text-red-600 dark:text-red-300">
                        {t('serviceNotRunningShort')}
                      </span>
                    )}
                  </span>
                );
              })}
              {overview.moduleGroups.length > 12 && (
                <span className="inline-flex items-center rounded-full border border-dashed px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                  {t('more', { count: overview.moduleGroups.length - 12 })}
                </span>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}

function Section(props: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { action, children, description, icon: Icon, title } = props;

  return (
    <section className="rounded-2xl border bg-card">
      <header className="flex items-start justify-between gap-3 border-b p-4">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="text-base font-bold">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Row(props: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  mono?: boolean;
  /** One line under the value explaining what it means. */
  help?: string;
}) {
  const { help, icon: Icon, label, mono, value } = props;

  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,9rem)_minmax(0,1fr)] items-center gap-2 py-2.5 first:pt-0 last:pb-0">
      <Icon className="size-4 text-muted-foreground" />
      <dt className="truncate text-sm text-muted-foreground">{label}</dt>
      <dd
        className={`break-words text-sm font-semibold text-primary/90 ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value || '-'}
        {help && (
          <span className="mt-0.5 block font-sans text-xs font-normal text-muted-foreground">
            {help}
          </span>
        )}
      </dd>
    </div>
  );
}
