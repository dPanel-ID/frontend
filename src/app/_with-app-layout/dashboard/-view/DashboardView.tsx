import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  ActivityIcon,
  AlertTriangleIcon,
  AppWindowIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CloudIcon,
  CpuIcon,
  DatabaseIcon,
  GitBranchIcon,
  Globe2Icon,
  HardDriveIcon,
  KeyRoundIcon,
  MemoryStickIcon,
  NetworkIcon,
  RefreshCwIcon,
  ServerIcon,
  Settings2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import {
  ApiApplication,
  ApiCloud,
  ApiDatabase,
  ApiDomain,
  ApiLoadBalancer,
  ApiOrganization,
  ApiSecret,
  ApiServer,
  ApiUser,
} from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { workspaceToOrganizationId } from '@/shared/api/-dtos';
import {
  LS_ORGANIZATION_ID,
  normalizeWorkspaceOrganizationId,
} from '@/shared/libs/api-client/config';
import type { Response as ApiResponse } from '@/shared/libs/api-client/rules/types';
import { isBrowser } from '@/shared/libs/browser/environment';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import {
  DASHBOARD_AGENT_EVENT_LINE_COUNT,
  DASHBOARD_AGENT_EVENT_LOG_FILE,
  dedupeAgentEvents,
  formatEventTimestamp,
  formatEventType,
  formatJson,
  parseAgentEventsFromLines,
} from '../-lib/agent-events';
import type { DashboardAgentEvent } from '../-lib/agent-events';

import Header from './Header';

const TELEMETRY_LIMIT = 8;
const TELEMETRY_POLL_MS = 15_000;
const MAX_HISTORY_POINTS = 24;
const RECENT_LIST_LIMIT = 3;
const AGENT_EVENT_LIMIT = 3;
const DPANEL_IAC_OWNER = 'dPanel-ID';
const WORKSPACE_IAC_REF = 'main';

interface WorkspaceIacRepository {
  owner: string;
  repo: string;
  ref: string;
  visibility: string;
}

interface TelemetryPoint {
  serverId: string;
  serverName: string;
  time: number;
  cpu?: number;
  memory?: number;
  disk?: number;
}

interface AggregatedTelemetryPoint {
  time: number;
  cpu?: number;
  memory?: number;
  disk?: number;
}

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'slate';

const EMPTY_SERVERS: DTOs.MachineV1[] = [];
const EMPTY_APPLICATIONS: DTOs.ApplicationV1[] = [];
const EMPTY_LOAD_BALANCERS: DTOs.LoadBalancerV2[] = [];
const EMPTY_MEMBERS: DTOs.OrganizationPeopleV1[] = [];
const EMPTY_CLOUD_PROJECTS: DTOs.CloudProjectV1[] = [];

export default function DashboardView() {
  const t = useDevetekTranslations();
  const { userProfile } = useAuthLoggedIn();

  const [profileResponse] = ApiUser.Profile.useGet();
  const [serversResponse] = ApiServer.Find.useGet({
    page: 1,
    pageSize: 24,
  });
  const [applicationsResponse] = ApiApplication.Find.useGet({
    page: 1,
    limit: 8,
  });
  const [loadBalancersResponse] = ApiLoadBalancer.Find.useGet({
    page: 1,
    limit: 6,
  });
  const [domainsResponse] = ApiDomain.Find.useGet({
    page: 1,
    perPage: 1,
  });
  const [databasesResponse] = ApiDatabase.Find.useGet({
    userId: userProfile.id,
    page: 1,
    pageSize: 1,
  });
  const [sshKeysResponse] = ApiSecret.SshKey.Find.useGet({
    page: 1,
    pageSize: 1,
  });
  const [cloudProjectsResponse] = ApiCloud.Project.Find.useGet({
    page: 1,
    pageSize: 6,
  });

  const profile = responseData(profileResponse);
  const serversData = responseData(serversResponse);
  const applicationsData = responseData(applicationsResponse);
  const loadBalancersData = responseData(loadBalancersResponse);
  const domainsData = responseData(domainsResponse);
  const databasesData = responseData(databasesResponse);
  const sshKeysData = responseData(sshKeysResponse);
  const cloudProjectsData = responseData(cloudProjectsResponse);

  const selectedWorkspaceId = useMemo(() => {
    if (!isBrowser()) return null;
    return normalizeWorkspaceOrganizationId(
      localStorage.getItem(LS_ORGANIZATION_ID),
    );
  }, []);

  const activeWorkspace = useMemo(() => {
    const activeWorkspaceId = selectedWorkspaceId || profile?.active_workspace;
    return profile?.workspaces?.find((workspace) => {
      return workspace.id === activeWorkspaceId;
    });
  }, [profile, selectedWorkspaceId]);

  const activeWorkspaceId =
    selectedWorkspaceId || profile?.active_workspace || activeWorkspace?.id;
  const activeWorkspaceName =
    activeWorkspace?.name ||
    (activeWorkspaceId
      ? t('page.dashboard.workspace.unknownTeam', {
          workspaceId: activeWorkspaceId,
        })
      : t('sidebar.workspacePicker.personalWorkspace'));
  const isTeamWorkspace = Boolean(
    activeWorkspace?.type === 'team' ||
    (activeWorkspaceId && activeWorkspaceId.startsWith('org-')),
  );
  const activeOrganizationId = isTeamWorkspace
    ? activeWorkspace?.local_organization_id ||
      workspaceToOrganizationId(activeWorkspaceId)
    : '';

  const [membersResponse] = ApiOrganization.Detail.$Id.Members.useGet({
    id: activeOrganizationId,
    page: 1,
    pageSize: 5,
    options: {
      skip: !activeOrganizationId,
    },
  });
  const membersData = responseData(membersResponse);

  const servers = serversData?.machines ?? EMPTY_SERVERS;
  const applications = applicationsData?.applications ?? EMPTY_APPLICATIONS;
  const loadBalancers = loadBalancersData?.routers ?? EMPTY_LOAD_BALANCERS;
  const members = membersData?.org_peoples ?? EMPTY_MEMBERS;
  const cloudProjects = cloudProjectsData?.clouds ?? EMPTY_CLOUD_PROJECTS;

  const serverStats = buildServerStats(servers);
  const applicationStats = buildApplicationStats(applications);
  const loadBalancerStats = buildLoadBalancerStats(loadBalancers);

  const telemetryServers = servers
    .filter((server) => server.id != null && server.status === 'ready')
    .slice(0, TELEMETRY_LIMIT);
  const [telemetryHistory, setTelemetryHistory] = useState<
    Record<string, TelemetryPoint[]>
  >({});

  const handleTelemetrySample = useCallback((sample: TelemetryPoint) => {
    setTelemetryHistory((current) => {
      const nextServerHistory = [
        ...(current[sample.serverId] ?? []),
        sample,
      ].slice(-MAX_HISTORY_POINTS);

      return {
        ...current,
        [sample.serverId]: nextServerHistory,
      };
    });
  }, []);

  const aggregatedTelemetry = useMemo(
    () => buildAggregatedTelemetry(telemetryHistory),
    [telemetryHistory],
  );
  const latestTelemetry = useMemo(
    () => buildLatestTelemetry(telemetryHistory),
    [telemetryHistory],
  );

  const totalServers = countFromPagination(
    serversData,
    serversData?.machines?.length,
  );
  const totalApplications = countFromPagination(
    applicationsData,
    applicationsData?.applications?.length,
  );
  const totalLoadBalancers = countFromPagination(
    loadBalancersData,
    loadBalancersData?.routers?.length,
  );
  const totalMembers = activeOrganizationId
    ? countFromPagination(membersData, membersData?.org_peoples?.length)
    : 1;
  const totalDomains = countFromPagination(
    domainsData,
    domainsData?.domains?.length,
  );
  const totalDatabases = countFromPagination(
    databasesData,
    databasesData?.databases?.length,
  );
  const totalSshKeys = countFromPagination(
    sshKeysData,
    sshKeysData?.secrets?.length,
  );
  const totalCloudProjects = countFromPagination(
    cloudProjectsData,
    cloudProjectsData?.clouds.length,
  );
  const workspaceIacRepository = buildWorkspaceIacRepository({
    isTeamWorkspace,
    organizationId: activeOrganizationId,
    userId: userProfile.id,
  });

  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        <WorkspaceOverview
          workspaceName={activeWorkspaceName}
          workspaceId={activeWorkspaceId}
          workspaceType={
            isTeamWorkspace
              ? t('page.dashboard.workspace.team')
              : t('page.dashboard.workspace.personal')
          }
          iacRepository={workspaceIacRepository}
        />

        <CloudProjectsPanel
          cloudProjects={cloudProjects}
          servers={servers}
          totalCloudProjects={totalCloudProjects}
        />

        <SummaryGrid
          totalServers={totalServers}
          totalApplications={totalApplications}
          totalLoadBalancers={totalLoadBalancers}
          totalDomains={totalDomains}
          totalDatabases={totalDatabases}
          totalSshKeys={totalSshKeys}
          readyServers={serverStats.ready}
          riskyResources={
            serverStats.attention +
            applicationStats.attention +
            loadBalancerStats.attention
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <ServerHealthPanel
              totalServers={totalServers}
              stats={serverStats}
              servers={servers}
              latestTelemetry={latestTelemetry}
            />

            <TelemetryPanel
              points={aggregatedTelemetry}
              telemetryServers={telemetryServers}
              sampledServerCount={Object.keys(telemetryHistory).length}
              totalReadyServers={serverStats.ready}
            />

            <AgentEventsPanel servers={servers} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <ResourceMixPanel
              applicationStats={applicationStats}
              loadBalancerStats={loadBalancerStats}
              totalApplications={totalApplications}
              totalLoadBalancers={totalLoadBalancers}
              totalDomains={totalDomains}
              totalDatabases={totalDatabases}
            />

            <MembersPanel
              members={members}
              isTeamWorkspace={isTeamWorkspace}
              totalMembers={totalMembers}
            />

            <ServersList servers={servers} limit={RECENT_LIST_LIMIT} />
            <ApplicationsList
              applications={applications}
              limit={RECENT_LIST_LIMIT}
            />
            <LoadBalancersList
              loadBalancers={loadBalancers}
              limit={RECENT_LIST_LIMIT}
            />
          </div>
        </div>
      </div>

      <div aria-hidden className="hidden">
        {telemetryServers.map((server) => (
          <DashboardServerTelemetryProbe
            key={server.id}
            server={server}
            onSample={handleTelemetrySample}
          />
        ))}
      </div>
    </>
  );
}

function WorkspaceOverview(props: {
  workspaceName: string;
  workspaceId?: string;
  workspaceType: string;
  iacRepository: WorkspaceIacRepository;
}) {
  const { iacRepository, workspaceId, workspaceName, workspaceType } = props;
  const t = useDevetekTranslations('page.dashboard');
  const iacRepositoryName = `${iacRepository.owner}/${iacRepository.repo}`;
  const iacRepositoryRef = t('workspace.iacRepositoryHelp', {
    ref: iacRepository.ref,
    visibility: t(`workspace.visibility.${iacRepository.visibility}`),
  });

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.48fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {workspaceType}
            </Badge>
            {workspaceId && (
              <span className="truncate text-xs font-medium text-muted-foreground">
                {workspaceId}
              </span>
            )}
          </div>
          <h2 className="mt-3 truncate text-xl font-bold text-primary">
            {workspaceName}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {t('workspace.description')}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-3">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Settings2Icon className="size-3.5" />
            {t('workspace.configTitle')}
          </p>
          <div className="grid gap-2">
            <WorkspaceConfigRow
              icon={GitBranchIcon}
              label={t('workspace.iacRepository')}
              value={iacRepositoryName}
              helper={iacRepositoryRef}
            />
            <WorkspaceConfigRow
              icon={ServerIcon}
              label={t('workspace.workerUsed')}
              value={t('workspace.notReported')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkspaceConfigRow(props: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
}) {
  const { helper, icon: Icon, label, value } = props;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary/65">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-primary">
          {value}
        </span>
        {helper && (
          <span className="block truncate text-xs text-muted-foreground">
            {helper}
          </span>
        )}
      </span>
    </div>
  );
}

function CloudProjectsPanel(props: {
  cloudProjects: DTOs.CloudProjectV1[];
  servers: DTOs.MachineV1[];
  totalCloudProjects?: number;
}) {
  const { cloudProjects, servers, totalCloudProjects } = props;
  const t = useDevetekTranslations('page.dashboard.cloudProjects');

  const serversByCloudProjectId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const server of servers) {
      if (!server.cloud_id) continue;
      counts.set(server.cloud_id, (counts.get(server.cloud_id) ?? 0) + 1);
    }
    return counts;
  }, [servers]);

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <Link
          to="/backend/cloud-projects"
          search={{
            page: 1,
            viewMode: 'auto',
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewAll')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-lg border bg-background p-3">
          <span className="flex size-10 items-center justify-center rounded-md border text-amber-600">
            <CloudIcon className="size-5" />
          </span>
          {totalCloudProjects == null ? (
            <Shimmer className="mt-4 h-8 w-16" />
          ) : (
            <p className="mt-4 text-3xl font-bold tabular-nums text-primary">
              {totalCloudProjects}
            </p>
          )}
          <p className="mt-1 text-sm font-bold text-primary">{t('total')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('totalHelp')}</p>
        </div>

        <div className="grid gap-2">
          {cloudProjects.length ? (
            cloudProjects.map((cloudProject, index) => (
              <CloudProjectListRow
                key={cloudProject.id ?? cloudProject.name ?? index}
                cloudProject={cloudProject}
                serverCount={
                  cloudProject.id
                    ? (serversByCloudProjectId.get(String(cloudProject.id)) ??
                      0)
                    : 0
                }
              />
            ))
          ) : (
            <EmptyLine>{t('empty')}</EmptyLine>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}

function CloudProjectListRow(props: {
  cloudProject: DTOs.CloudProjectV1;
  serverCount: number;
}) {
  const { cloudProject, serverCount } = props;
  const t = useDevetekTranslations('page.dashboard.cloudProjects');
  const displayName = cloudProject.name || t('unknown');
  const provider = cloudProject.provider || t('unknownProvider');
  const owner =
    cloudProject.organization?.name ||
    cloudProject.user?.fullname ||
    cloudProject.user?.username ||
    cloudProject.user?.email ||
    t('unknownOwner');
  const updatedAt = cloudProject.updated_at
    ? t('updated', {
        date: dayjs(cloudProject.updated_at).format('YYYY-MM-DD HH:mm'),
      })
    : t('notUpdated');

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-amber-600">
        <CloudIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">
          {displayName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {provider} / {owner} / {updatedAt}
        </span>
      </span>
      <Badge variant="outline" className="shrink-0">
        {t('servers', { count: serverCount })}
      </Badge>
    </div>
  );
}

function SummaryGrid(props: {
  totalServers?: number;
  totalApplications?: number;
  totalLoadBalancers?: number;
  totalDomains?: number;
  totalDatabases?: number;
  totalSshKeys?: number;
  readyServers: number;
  riskyResources: number;
}) {
  const t = useDevetekTranslations('page.dashboard.summary');
  const {
    readyServers,
    riskyResources,
    totalApplications,
    totalDatabases,
    totalDomains,
    totalLoadBalancers,
    totalServers,
    totalSshKeys,
  } = props;

  const stats = [
    {
      label: t('servers'),
      value: totalServers,
      helper: t('readyServers', { count: readyServers }),
      icon: ServerIcon,
      to: '/servers',
      tone: 'blue' as const,
    },
    {
      label: t('applications'),
      value: totalApplications,
      helper: t('attention', { count: riskyResources }),
      icon: AppWindowIcon,
      to: '/applications',
      tone: riskyResources > 0 ? ('amber' as const) : ('green' as const),
    },
    {
      label: t('loadBalancers'),
      value: totalLoadBalancers,
      helper: t('trafficEntry'),
      icon: NetworkIcon,
      to: '/backend/load-balancers',
      tone: 'violet' as const,
    },
    {
      label: t('domains'),
      value: totalDomains,
      helper: t('dnsZones'),
      icon: Globe2Icon,
      to: '/backend/domain',
      tone: 'green' as const,
    },
    {
      label: t('databases'),
      value: totalDatabases,
      helper: t('statefulData'),
      icon: DatabaseIcon,
      to: '/backend/database',
      tone: 'blue' as const,
    },
    {
      label: t('secrets'),
      value: totalSshKeys,
      helper: t('sshKeys'),
      icon: KeyRoundIcon,
      to: '/backend/secret-managers/ssh-key',
      tone: 'slate' as const,
    },
  ];

  return (
    <section
      aria-label={t('ariaLabel')}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}

function StatCard(props: {
  label: string;
  value?: number;
  helper: string;
  icon: LucideIcon;
  to: string;
  tone: Tone;
}) {
  const { helper, icon: Icon, label, to, tone, value } = props;

  return (
    <Link
      to={to}
      className={cn(
        'group min-w-0 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-background xl:px-3 xl:py-2.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border xl:size-8',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {value == null ? (
        <Shimmer className="mt-4 h-7 w-16" />
      ) : (
        <p className="mt-4 text-2xl font-bold tabular-nums text-primary xl:mt-3 xl:text-xl">
          {value}
        </p>
      )}
      <p className="mt-1 truncate text-sm font-semibold text-primary xl:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>
    </Link>
  );
}

function ServerHealthPanel(props: {
  totalServers?: number;
  stats: ReturnType<typeof buildServerStats>;
  servers: DTOs.MachineV1[];
  latestTelemetry: Record<string, TelemetryPoint>;
}) {
  const { latestTelemetry, servers, stats, totalServers } = props;
  const t = useDevetekTranslations('page.dashboard.serverHealth');

  const providerBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const server of servers) {
      const provider = server.provider || server.source || t('unknownProvider');
      counts.set(provider, (counts.get(provider) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5);
  }, [servers, t]);
  const telemetryCount = Object.keys(latestTelemetry).length;
  const primaryProvider = providerBreakdown[0];
  const readinessPercent = totalServers
    ? Math.round((stats.ready / totalServers) * 100)
    : 0;
  const insightItems = [
    totalServers
      ? stats.attention > 0
        ? t('insightAttention', { count: stats.attention })
        : t('insightHealthy', { percent: readinessPercent })
      : t('insightNoServers'),
    stats.progress > 0
      ? t('insightProgress', { count: stats.progress })
      : t('insightNoProgress'),
    stats.ready > 0
      ? t('insightTelemetry', {
          sampled: telemetryCount,
          total: stats.ready,
        })
      : t('insightNoTelemetry'),
    primaryProvider
      ? t('insightProvider', {
          provider: primaryProvider[0],
          count: primaryProvider[1],
          total: servers.length,
        })
      : t('insightNoProvider'),
  ];

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <Link
          to="/servers"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewServers')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.48fr)]">
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <StatusMetric
              icon={CheckCircle2Icon}
              label={t('ready')}
              helper={t('readyHelp')}
              value={stats.ready}
              tone="green"
              total={totalServers}
            />
            <StatusMetric
              icon={RefreshCwIcon}
              label={t('progress')}
              helper={t('progressHelp')}
              value={stats.progress}
              tone="blue"
              total={totalServers}
            />
            <StatusMetric
              icon={AlertTriangleIcon}
              label={t('attention')}
              helper={t('attentionHelp')}
              value={stats.attention}
              tone="amber"
              total={totalServers}
            />
            <StatusMetric
              icon={ActivityIcon}
              label={t('withTelemetry')}
              helper={t('telemetryHelp')}
              value={telemetryCount}
              tone="violet"
              total={stats.ready}
            />
          </div>

          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('insightTitle')}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {insightItems.map((item) => (
                <div
                  key={item}
                  className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground"
                >
                  <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  <span className="min-w-0">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t('providerMix')}
          </p>
          <div className="mt-3 grid gap-2">
            {providerBreakdown.length ? (
              providerBreakdown.map(([provider, count]) => (
                <MeterRow
                  key={provider}
                  label={provider}
                  value={count}
                  total={servers.length}
                />
              ))
            ) : (
              <EmptyLine>{t('emptyProviders')}</EmptyLine>
            )}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}

function StatusMetric(props: {
  icon: LucideIcon;
  label: string;
  helper: string;
  value: number;
  tone: Tone;
  total?: number;
}) {
  const { helper, icon: Icon, label, tone, total, value } = props;
  const percent = total ? (value / total) * 100 : 0;
  const displayTotal = total ?? 0;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight text-primary">
            {label}
          </span>
          <span className="mt-1 block text-xs leading-snug text-muted-foreground">
            {helper}
          </span>
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tabular-nums text-primary">{value}</p>
        <p className="pb-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {value} / {displayTotal}
        </p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${clampPercent(percent)}%` }}
        />
      </div>
    </div>
  );
}

function TelemetryPanel(props: {
  points: AggregatedTelemetryPoint[];
  telemetryServers: DTOs.MachineV1[];
  sampledServerCount: number;
  totalReadyServers: number;
}) {
  const { points, sampledServerCount, telemetryServers, totalReadyServers } =
    props;
  const t = useDevetekTranslations('page.dashboard.telemetry');
  const latestPoint = points.at(-1);
  const coverage =
    totalReadyServers > TELEMETRY_LIMIT
      ? t('coverageLimited', {
          sampled: telemetryServers.length,
          total: totalReadyServers,
        })
      : t('coverage', {
          sampled: sampledServerCount,
          total: totalReadyServers,
        });

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <span className="text-xs font-medium text-muted-foreground">
          {coverage}
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <TrendChart points={points} />

        <div className="grid content-start gap-2">
          <TelemetryLegend
            icon={CpuIcon}
            label={t('cpu')}
            value={latestPoint?.cpu}
            tone="blue"
          />
          <TelemetryLegend
            icon={MemoryStickIcon}
            label={t('memory')}
            value={latestPoint?.memory}
            tone="green"
          />
          <TelemetryLegend
            icon={HardDriveIcon}
            label={t('disk')}
            value={latestPoint?.disk}
            tone="amber"
          />
          <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
            {t('backendNote')}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}

function TrendChart(props: { points: AggregatedTelemetryPoint[] }) {
  const { points } = props;
  const t = useDevetekTranslations('page.dashboard.telemetry');
  const hasTrend = points.length >= 2;
  const width = 720;
  const height = 220;

  return (
    <div className="min-h-64 rounded-lg border bg-background p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t('chartTitle')}
        </p>
        <span className="text-xs text-muted-foreground">
          {points.at(-1)
            ? dayjs(points.at(-1)?.time).format('HH:mm:ss')
            : t('waiting')}
        </span>
      </div>

      {hasTrend ? (
        <svg
          role="img"
          aria-label={t('chartAria')}
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = chartY(tick, height);
            return (
              <g key={tick}>
                <line
                  x1="34"
                  x2={width - 12}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeDasharray="4 5"
                />
                <text
                  x="0"
                  y={y + 4}
                  className="fill-muted-foreground text-[10px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}
          <polyline
            points={chartPoints(points, width, height, 'cpu')}
            fill="none"
            stroke="var(--color-blue-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={chartPoints(points, width, height, 'memory')}
            fill="none"
            stroke="var(--color-green-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={chartPoints(points, width, height, 'disk')}
            fill="none"
            stroke="var(--color-amber-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div className="flex h-52 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          {t('waiting')}
        </div>
      )}
    </div>
  );
}

function TelemetryLegend(props: {
  icon: LucideIcon;
  label: string;
  value?: number;
  tone: Tone;
}) {
  const { icon: Icon, label, tone, value } = props;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xl font-bold tabular-nums text-primary">
        {formatPercent(value)}
      </p>
    </div>
  );
}

interface AgentEventProbeState {
  events?: DashboardAgentEvent[];
  status: ApiResponse<string[]>['$status'];
}

function AgentEventsPanel(props: { servers: DTOs.MachineV1[] }) {
  const { servers } = props;
  const t = useDevetekTranslations('page.dashboard.agentEvents');
  const [refreshToken, setRefreshToken] = useState(0);
  const [probeStates, setProbeStates] = useState<
    Record<string, AgentEventProbeState>
  >({});

  const eventServers = useMemo(
    () => servers.filter((server) => server.id != null),
    [servers],
  );
  const activeServerIds = useMemo(
    () => new Set(eventServers.map((server) => String(server.id))),
    [eventServers],
  );
  const events = useMemo(
    () =>
      dedupeAgentEvents(
        Object.values(probeStates)
          .flatMap((state) => state.events ?? [])
          .filter((event) => activeServerIds.has(event.serverId)),
      )
        .sort((left, right) => right.sortTime - left.sortTime)
        .slice(0, AGENT_EVENT_LIMIT),
    [activeServerIds, probeStates],
  );
  const hasPendingProbe = eventServers.some((server) => {
    const state = probeStates[String(server.id)];
    return !state || state.status === 'initial' || state.status === 'loading';
  });
  const failedProbeCount = eventServers.filter((server) => {
    return probeStates[String(server.id)]?.status === 'failed';
  }).length;

  const handleProbeUpdate = useCallback(
    (serverId: string, nextState: AgentEventProbeState) => {
      setProbeStates((current) => {
        const currentState = current[serverId];

        return {
          ...current,
          [serverId]: {
            status: nextState.status,
            events: nextState.events ?? currentState?.events ?? [],
          },
        };
      });
    },
    [],
  );
  const handleRefresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          disabled={!eventServers.length}
          onClick={handleRefresh}
          title={t('refresh')}
          aria-label={t('refreshAria')}
        >
          <RefreshCwIcon
            className={cn('size-3.5', hasPendingProbe && 'animate-spin')}
          />
          {t('refresh')}
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="font-semibold">
          {t('showing', {
            count: events.length,
            limit: AGENT_EVENT_LIMIT,
          })}
        </Badge>
        {failedProbeCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangleIcon className="size-3" />
            {t('partialFailure', {
              count: failedProbeCount,
            })}
          </span>
        )}
      </div>

      {hasPendingProbe && !events.length ? (
        <div className="grid gap-2">
          <AgentEventSkeleton />
          <AgentEventSkeleton />
          <AgentEventSkeleton />
        </div>
      ) : events.length ? (
        <div className="grid gap-2">
          {events.map((event) => (
            <AgentEventRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
          {eventServers.length ? t('empty') : t('emptyServers')}
        </div>
      )}

      {eventServers.map((server) => (
        <AgentEventsProbe
          key={server.id}
          refreshToken={refreshToken}
          server={server}
          onUpdate={handleProbeUpdate}
        />
      ))}
    </DashboardSection>
  );
}

function AgentEventsProbe(props: {
  onUpdate: (serverId: string, state: AgentEventProbeState) => void;
  refreshToken: number;
  server: DTOs.MachineV1;
}) {
  const { onUpdate, refreshToken, server } = props;
  const serverId = String(server.id ?? '');
  const [response, refresh] = ApiServer.Detail.$Id.Log.useGet({
    serverId,
    file: DASHBOARD_AGENT_EVENT_LOG_FILE,
    line: DASHBOARD_AGENT_EVENT_LINE_COUNT,
    options: {
      skip: !serverId,
    },
  });

  const lines = responseData(response);
  const events = useMemo(
    () => parseAgentEventsFromLines(lines ?? [], server),
    [lines, server],
  );

  useEffect(() => {
    if (refreshToken <= 0) return;
    refresh();
  }, [refresh, refreshToken]);

  useEffect(() => {
    onUpdate(serverId, {
      status: response.$status,
      events: response.$status === 'failed' ? undefined : events,
    });
  }, [events, onUpdate, response.$status, serverId]);

  return null;
}

function AgentEventRow(props: { event: DashboardAgentEvent }) {
  const { event } = props;
  const t = useDevetekTranslations('page.dashboard.agentEvents');
  const tone = agentEventTone(event.level, event.status);

  return (
    <article className="rounded-lg border bg-background p-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
            toneClass(tone),
          )}
          aria-hidden
        >
          {event.level === 'error' ? (
            <AlertTriangleIcon className="size-4" />
          ) : (
            <ActivityIcon className="size-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-primary">
              {formatEventType(event.eventType) || t('unknownEvent')}
            </h3>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-semibold',
                toneClass(tone),
              )}
            >
              {event.status || event.level}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {event.message}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <AgentEventMeta label={t('server')} value={event.serverName} />
            <AgentEventMeta label={t('eventId')} value={event.eventId} />
            <AgentEventMeta label={t('sequence')} value={event.sequence} />
            <AgentEventMeta
              label={t('time')}
              value={formatEventTimestamp(event.timestamp)}
            />
          </div>

          <details className="mt-2 rounded-md border bg-card px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
              {t('details')}
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-primary">
              {formatJson(event.details)}
            </pre>
          </details>
        </div>
      </div>
    </article>
  );
}

function AgentEventMeta(props: { label: string; value?: string }) {
  const { label, value } = props;
  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1 rounded-full border bg-card px-2 py-0.5">
      <span className="shrink-0 font-medium">{label}</span>
      <span className="min-w-0 truncate text-primary">{value}</span>
    </span>
  );
}

function AgentEventSkeleton() {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex gap-3">
        <Shimmer className="size-9 shrink-0 rounded-md" />
        <div className="grid flex-1 gap-2">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

function ResourceMixPanel(props: {
  applicationStats: ReturnType<typeof buildApplicationStats>;
  loadBalancerStats: ReturnType<typeof buildLoadBalancerStats>;
  totalApplications?: number;
  totalLoadBalancers?: number;
  totalDomains?: number;
  totalDatabases?: number;
}) {
  const {
    applicationStats,
    loadBalancerStats,
    totalApplications,
    totalDatabases,
    totalDomains,
    totalLoadBalancers,
  } = props;
  const t = useDevetekTranslations('page.dashboard.resourceMix');

  return (
    <DashboardSection title={t('title')} description={t('description')}>
      <div className="grid gap-3">
        <MeterRow
          label={t('applicationsReady')}
          value={applicationStats.ready}
          total={totalApplications}
        />
        <MeterRow
          label={t('loadBalancersReady')}
          value={loadBalancerStats.ready}
          total={totalLoadBalancers}
        />
        <MeterRow
          label={t('domains')}
          value={totalDomains}
          total={(totalDomains ?? 0) + (totalDatabases ?? 0)}
        />
        <MeterRow
          label={t('databases')}
          value={totalDatabases}
          total={(totalDomains ?? 0) + (totalDatabases ?? 0)}
        />
      </div>
    </DashboardSection>
  );
}

function MembersPanel(props: {
  members: DTOs.OrganizationPeopleV1[];
  isTeamWorkspace: boolean;
  totalMembers?: number;
}) {
  const { isTeamWorkspace, members, totalMembers } = props;
  const t = useDevetekTranslations('page.dashboard.members');

  return (
    <DashboardSection
      title={t('title')}
      description={t(
        isTeamWorkspace ? 'teamDescription' : 'personalDescription',
      )}
      action={
        isTeamWorkspace ? (
          <Link
            to="/teams"
            search={{
              page: 1,
              viewMode: 'auto',
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
          >
            {t('manage')}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        ) : undefined
      }
    >
      <div className="grid gap-2">
        {isTeamWorkspace && members.length ? (
          members.slice(0, 5).map((member) => {
            const displayName =
              member.user?.fullname || member.user?.username || t('unknown');
            return (
              <div
                key={member.id || member.user_id || displayName}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user?.email || t('noEmail')}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t('member')}
                </Badge>
              </div>
            );
          })
        ) : (
          <EmptyLine>
            {isTeamWorkspace ? t('emptyTeam') : t('personalOnly')}
          </EmptyLine>
        )}

        {totalMembers != null && totalMembers > members.length && (
          <p className="text-xs text-muted-foreground">
            {t('moreMembers', { count: totalMembers - members.length })}
          </p>
        )}
      </div>
    </DashboardSection>
  );
}

function ServersList(props: { servers: DTOs.MachineV1[]; limit: number }) {
  const { limit, servers } = props;
  const t = useDevetekTranslations('page.dashboard.lists.servers');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/servers"
    >
      {servers.length ? (
        servers
          .slice(0, limit)
          .map((server) => (
            <CompactResourceRow
              key={server.id || server.hostname}
              icon={ServerIcon}
              title={server.hostname || t('unknown')}
              subtitle={server.address || server.provider || t('noAddress')}
              status={server.status || t('unknownStatus')}
              statusTone={statusTone(server.status)}
              to={server.id ? '/servers/$id' : undefined}
              params={server.id ? { id: String(server.id) } : undefined}
            />
          ))
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}

function ApplicationsList(props: {
  applications: DTOs.ApplicationV1[];
  limit: number;
}) {
  const { applications, limit } = props;
  const t = useDevetekTranslations('page.dashboard.lists.applications');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/applications"
    >
      {applications.length ? (
        applications.slice(0, limit).map((application) => {
          const latestStatus =
            application.artifacts?.[0]?.installer_status ||
            application.deploys?.[0]?.installer_status;

          return (
            <CompactResourceRow
              key={application.id || application.name}
              icon={AppWindowIcon}
              title={application.name || t('unknown')}
              subtitle={
                application.repo_name ||
                application.domain ||
                application.bundle_type ||
                t('noSource')
              }
              status={latestStatus || t('unknownStatus')}
              statusTone={statusTone(latestStatus)}
              to={application.id ? '/applications/$id' : undefined}
              params={
                application.id ? { id: String(application.id) } : undefined
              }
            />
          );
        })
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}

function LoadBalancersList(props: {
  loadBalancers: DTOs.LoadBalancerV2[];
  limit: number;
}) {
  const { limit, loadBalancers } = props;
  const t = useDevetekTranslations('page.dashboard.lists.loadBalancers');

  return (
    <CompactListSection
      title={t('title')}
      description={t('description')}
      to="/backend/load-balancers"
    >
      {loadBalancers.length ? (
        loadBalancers
          .slice(0, limit)
          .map((loadBalancer) => (
            <CompactResourceRow
              key={loadBalancer.id || loadBalancer.domain || loadBalancer.name}
              icon={NetworkIcon}
              title={loadBalancer.name || loadBalancer.domain || t('unknown')}
              subtitle={
                loadBalancer.domain ||
                loadBalancer.engine ||
                loadBalancer.machine?.hostname ||
                t('noDomain')
              }
              status={loadBalancer.installer_status || t('unknownStatus')}
              statusTone={statusTone(loadBalancer.installer_status)}
              to="/backend/load-balancers"
            />
          ))
      ) : (
        <EmptyLine>{t('empty')}</EmptyLine>
      )}
    </CompactListSection>
  );
}

function CompactListSection(props: {
  title: string;
  description: string;
  to: string;
  children: ReactNode;
}) {
  const { children, description, title, to } = props;
  const t = useDevetekTranslations('page.dashboard');

  return (
    <DashboardSection
      title={title}
      description={description}
      action={
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {t('viewAll')}
          <ArrowRightIcon className="size-3.5" />
        </Link>
      }
    >
      <div className="grid gap-2">{children}</div>
    </DashboardSection>
  );
}

function CompactResourceRow(props: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status: string;
  statusTone: Tone;
  to?: string;
  params?: Record<string, string>;
}) {
  const {
    icon: Icon,
    params,
    status,
    statusTone: tone,
    subtitle,
    title,
    to,
  } = props;
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-primary/60">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span
        className={cn(
          'max-w-28 shrink-0 truncate rounded-full border px-2 py-0.5 text-xs font-semibold',
          toneClass(tone),
        )}
      >
        {status}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        params={params}
        className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background px-3 py-2">
      {content}
    </div>
  );
}

function DashboardSection(props: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { action, children, description, title } = props;

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-primary">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function MeterRow(props: { label: string; value?: number; total?: number }) {
  const { label, total, value } = props;
  const safeValue = value ?? 0;
  const percent = total ? (safeValue / total) * 100 : 0;

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-medium text-muted-foreground">
          {label}
        </span>
        <span className="font-bold tabular-nums text-primary">
          {value == null ? '—' : safeValue}
          {total ? (
            <span className="font-medium text-muted-foreground">
              {' '}
              / {total}
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-2 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${clampPercent(percent)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyLine(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <div className="rounded-lg border border-dashed bg-background px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function DashboardServerTelemetryProbe(props: {
  server: DTOs.MachineV1;
  onSample: (sample: TelemetryPoint) => void;
}) {
  const { onSample, server } = props;
  const serverId = server.id ? String(server.id) : '';
  const shouldFetch = Boolean(serverId) && server.status === 'ready';

  const [cpuResponse] = ApiServer.Origin.$Id.Cpu.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });
  const [memoryResponse] = ApiServer.Origin.$Id.Memory.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });
  const [diskResponse] = ApiServer.Origin.$Id.Disk.Usage.useGet({
    serverId,
    options: {
      skip: !shouldFetch,
      refreshIntervalMs: TELEMETRY_POLL_MS,
    },
  });

  const cpuData = responseData(cpuResponse);
  const memoryData = responseData(memoryResponse);
  const diskData = responseData(diskResponse);
  const cpu = sanitizePercent(cpuData?.cpu_usage);
  const memory = sanitizePercent(memoryData?.used_percent);
  const disk = sanitizePercent(
    diskData?.total ? (diskData.used / diskData.total) * 100 : undefined,
  );

  useEffect(() => {
    if (!shouldFetch) return;
    if (cpu == null && memory == null && disk == null) return;

    onSample({
      serverId,
      serverName: server.hostname || server.address || serverId,
      time: Date.now(),
      cpu,
      memory,
      disk,
    });
  }, [
    cpu,
    disk,
    memory,
    onSample,
    server.address,
    server.hostname,
    serverId,
    shouldFetch,
  ]);

  return null;
}

function buildServerStats(servers: DTOs.MachineV1[]) {
  return servers.reduce(
    (acc, server) => {
      const status = String(server.status || '').toLowerCase();

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'progress' || status === 'deleting') {
        acc.progress += 1;
      } else if (status === 'failed' || status === 'cancelled') {
        acc.attention += 1;
      } else {
        acc.unknown += 1;
      }

      return acc;
    },
    {
      ready: 0,
      progress: 0,
      attention: 0,
      unknown: 0,
    },
  );
}

function buildApplicationStats(applications: DTOs.ApplicationV1[]) {
  return applications.reduce(
    (acc, application) => {
      const status = String(
        application.artifacts?.[0]?.installer_status ||
          application.deploys?.[0]?.installer_status ||
          '',
      ).toLowerCase();

      if (application.app_config?.auto_deploy?.enabled) {
        acc.autoDeploy += 1;
      }

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'failed' || status === 'cancelled') {
        acc.attention += 1;
      }

      return acc;
    },
    {
      ready: 0,
      autoDeploy: 0,
      attention: 0,
    },
  );
}

function buildLoadBalancerStats(loadBalancers: DTOs.LoadBalancerV2[]) {
  return loadBalancers.reduce(
    (acc, loadBalancer) => {
      const status = String(loadBalancer.installer_status || '').toLowerCase();

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'failed' || status === 'cancelled') {
        acc.attention += 1;
      }

      return acc;
    },
    {
      ready: 0,
      attention: 0,
    },
  );
}

function buildAggregatedTelemetry(
  history: Record<string, TelemetryPoint[]>,
): AggregatedTelemetryPoint[] {
  const buckets = new Map<
    number,
    {
      cpu: number[];
      memory: number[];
      disk: number[];
    }
  >();

  for (const points of Object.values(history)) {
    for (const point of points) {
      const bucketKey = Math.floor(point.time / TELEMETRY_POLL_MS);
      const bucketTime = bucketKey * TELEMETRY_POLL_MS;
      const bucket = buckets.get(bucketTime) ?? {
        cpu: [],
        memory: [],
        disk: [],
      };

      if (point.cpu != null) bucket.cpu.push(point.cpu);
      if (point.memory != null) bucket.memory.push(point.memory);
      if (point.disk != null) bucket.disk.push(point.disk);
      buckets.set(bucketTime, bucket);
    }
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0] - right[0])
    .slice(-MAX_HISTORY_POINTS)
    .map(([time, bucket]) => ({
      time,
      cpu: average(bucket.cpu),
      memory: average(bucket.memory),
      disk: average(bucket.disk),
    }));
}

function buildLatestTelemetry(history: Record<string, TelemetryPoint[]>) {
  return Object.fromEntries(
    Object.entries(history).flatMap(([serverId, points]) => {
      const latest = points.at(-1);
      return latest ? [[serverId, latest]] : [];
    }),
  );
}

function buildWorkspaceIacRepository(params: {
  isTeamWorkspace: boolean;
  organizationId: string;
  userId: number | string;
}): WorkspaceIacRepository {
  const { isTeamWorkspace, organizationId, userId } = params;
  const suffix = isTeamWorkspace
    ? `organization-${organizationId}`
    : `personal-${userId}`;

  return {
    owner: DPANEL_IAC_OWNER,
    repo: `dpanel-iac-${suffix}`,
    ref: WORKSPACE_IAC_REF,
    visibility: 'private',
  };
}

function agentEventTone(
  level: DashboardAgentEvent['level'],
  status?: string,
): Tone {
  const normalizedStatus = String(status ?? '').toLowerCase();
  if (normalizedStatus) return statusTone(normalizedStatus);

  if (level === 'error') return 'red';
  if (level === 'warn') return 'amber';
  if (level === 'notice') return 'violet';
  if (level === 'debug') return 'slate';
  return 'green';
}

function responseData<T>(response: ApiResponse<T>): T | undefined {
  if (response.$status === 'success') return response;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}

function countFromPagination(
  data: { pagination?: DTOs.Pagination } | undefined,
  fallback?: number,
) {
  return data?.pagination?.total_item ?? fallback;
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function chartPoints(
  points: AggregatedTelemetryPoint[],
  width: number,
  height: number,
  key: 'cpu' | 'memory' | 'disk',
) {
  const usableWidth = width - 46;
  const lastIndex = Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = 34 + (index / lastIndex) * usableWidth;
      const y = chartY(point[key] ?? 0, height);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function chartY(value: number, height: number) {
  const paddingTop = 14;
  const paddingBottom = 24;
  const usableHeight = height - paddingTop - paddingBottom;
  return paddingTop + (1 - clampPercent(value) / 100) * usableHeight;
}

function sanitizePercent(value?: number) {
  if (value == null || Number.isNaN(value)) return undefined;
  return clampPercent(value);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatPercent(value?: number) {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
}

function statusTone(status?: string): Tone {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'ready' || normalized === 'running') return 'green';
  if (normalized === 'progress' || normalized === 'deleting') return 'blue';
  if (normalized === 'failed' || normalized === 'cancelled') return 'red';
  if (normalized === 'dead' || normalized === 'exited') return 'amber';
  return 'slate';
}

function toneClass(tone: Tone) {
  switch (tone) {
    case 'blue':
      return 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'green':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'amber':
      return 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'red':
      return 'border-destructive/25 bg-destructive/10 text-destructive';
    case 'violet':
      return 'border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400';
    default:
      return 'border-border bg-background text-muted-foreground';
  }
}
