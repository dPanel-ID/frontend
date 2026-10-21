import { useCallback, useMemo, useState } from 'react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import {
  ApiApplication,
  ApiCloud,
  ApiDatabase,
  ApiDomain,
  ApiLoadBalancer,
  ApiModule,
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
import { isBrowser } from '@/shared/libs/browser/environment';

import {
  countFromPagination,
  isPendingResponse,
  responseData,
} from '../-lib/api-response';
import {
  buildApplicationStats,
  buildLoadBalancerStats,
  buildServerStats,
} from '../-lib/stats';
import { TELEMETRY_LIMIT } from '../-lib/telemetry';
import type { TelemetrySample } from '../-lib/telemetry';
import { buildWorkspaceIacRepository } from '../-lib/workspace';
import { KpiBlock } from '../-presentation';
import { resolveDashboardTab } from '../-rules/tabs';
import type { DashboardTab } from '../-rules/tabs';
import { useDashboardHealth } from '../-usecase/use-dashboard-health';

import ActivityChart from './ActivityChart/ActivityChart';
import ActivityPanel from './ActivityPanel/ActivityPanel';
import ApplicationsList from './ApplicationsList/ApplicationsList';
import AttentionPanel from './AttentionPanel/AttentionPanel';
import DashboardServerTelemetryProbe from './CapacityPanel/DashboardServerTelemetryProbe';
import CloudProjectsPanel from './CloudProjectsPanel/CloudProjectsPanel';
import FleetUtilisationPanel from './FleetUtilisationPanel/FleetUtilisationPanel';
import Header from './Header';
import HealthVerdict from './HealthVerdict/HealthVerdict';
import LoadBalancersList from './LoadBalancersList/LoadBalancersList';
import MembersPanel from './MembersPanel/MembersPanel';
import ServerHealthPanel from './ServerHealthPanel/ServerHealthPanel';
import ServersList from './ServersList/ServersList';
import TabNav from './TabNav';
import WorkspaceOverview from './WorkspaceOverview/WorkspaceOverview';

const RECENT_LIST_LIMIT = 3;

const EMPTY_SERVERS: DTOs.MachineV1[] = [];
const EMPTY_APPLICATIONS: DTOs.ApplicationV1[] = [];
const EMPTY_LOAD_BALANCERS: DTOs.LoadBalancerV2[] = [];
const EMPTY_MEMBERS: DTOs.OrganizationPeopleV1[] = [];
const EMPTY_CLOUD_PROJECTS: DTOs.CloudProjectV1[] = [];

export interface DashboardViewProps {
  /** The tab from the URL. A tab this workspace does not have falls back. */
  tab: DashboardTab;
}

export default function DashboardView(props: DashboardViewProps) {
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
  const [iacRepositoryResponse] = ApiModule.Repository.useGet();

  const profile = responseData(profileResponse);
  const serversData = responseData(serversResponse);
  const applicationsData = responseData(applicationsResponse);
  const loadBalancersData = responseData(loadBalancersResponse);
  const domainsData = responseData(domainsResponse);
  const databasesData = responseData(databasesResponse);
  const sshKeysData = responseData(sshKeysResponse);
  const cloudProjectsData = responseData(cloudProjectsResponse);
  const iacRepositoryData = responseData(iacRepositoryResponse);

  const selectedWorkspaceId = useMemo(() => {
    if (!isBrowser()) return null;
    return normalizeWorkspaceOrganizationId(
      localStorage.getItem(LS_ORGANIZATION_ID),
    );
  }, []);

  const profileActiveWorkspaceId = normalizeWorkspaceOrganizationId(
    profile?.active_workspace,
  );
  const activeWorkspaceId = selectedWorkspaceId || profileActiveWorkspaceId;
  const activeWorkspace = profile?.workspaces?.find((workspace) => {
    return workspaceToOrganizationId(workspace.id) === activeWorkspaceId;
  });

  const activeWorkspaceName =
    activeWorkspace?.name ||
    (activeWorkspaceId
      ? t('page.dashboard.workspace.unknownTeam', {
          workspaceId: activeWorkspaceId,
        })
      : t('sidebar.workspacePicker.personalWorkspace'));
  const isTeamWorkspace = Boolean(
    activeWorkspace?.type === 'team' ||
    (activeWorkspaceId && activeWorkspaceId !== 'personal'),
  );
  const activeOrganizationId = isTeamWorkspace
    ? workspaceToOrganizationId(activeWorkspace?.id || activeWorkspaceId)
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

  const health = useDashboardHealth({
    servers,
    serversUnavailable: serversResponse.$status === 'failed',
  });

  const telemetryServers = servers
    .filter((server) => server.id != null && server.status === 'ready')
    .slice(0, TELEMETRY_LIMIT);

  // Only the latest reading per server is kept: the capacity panel reports
  // worst case now, so a per-visit history would buy nothing and show nothing
  // until it filled up.
  const [samplesByServerId, setSamplesByServerId] = useState<
    Record<string, TelemetrySample>
  >({});
  // The probes stay only to count servers answering telemetry for the server
  // health panel; they retire with that panel in the consolidation pass.
  const probeGeneration = 0;

  const handleTelemetrySample = useCallback((sample: TelemetrySample) => {
    setSamplesByServerId((current) => ({
      ...current,
      [sample.serverId]: sample,
    }));
  }, []);

  // Remounting the probes is how a retry refetches: each one owns its own
  // requests, so there is no single refresh handle to call.

  const samples = useMemo(
    () => Object.values(samplesByServerId),
    [samplesByServerId],
  );
  const reportingServerCount = samples.filter(
    (sample) => !sample.unreachable,
  ).length;

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
  const workspaceIacRepository = buildWorkspaceIacRepository(iacRepositoryData);

  const activeTab = resolveDashboardTab(props.tab, isTeamWorkspace);

  // The estate as headline numbers. Counts are totals, not series, so each
  // carries its own status breakdown rather than an invented trend line.
  const estateItems = [
    {
      key: 'servers',
      label: t('page.dashboard.estate.servers'),
      value: totalServers,
      hint: t('page.dashboard.estate.serversHint', {
        ready: serverStats.ready,
        attention: serverStats.attention,
      }),
      hintNeedsAttention: serverStats.attention > 0,
      to: '/servers',
    },
    {
      key: 'applications',
      label: t('page.dashboard.estate.applications'),
      value: totalApplications,
      hint: t('page.dashboard.estate.applicationsHint', {
        ready: applicationStats.ready,
        attention: applicationStats.attention,
      }),
      hintNeedsAttention: applicationStats.attention > 0,
      to: '/applications',
    },
    {
      key: 'loadBalancers',
      label: t('page.dashboard.estate.loadBalancers'),
      value: totalLoadBalancers,
      hint: t('page.dashboard.estate.loadBalancersHint', {
        ready: loadBalancerStats.ready,
        attention: loadBalancerStats.attention,
      }),
      hintNeedsAttention: loadBalancerStats.attention > 0,
      to: '/backend/load-balancers',
    },
    {
      key: 'cloudProjects',
      label: t('page.dashboard.estate.cloudProjects'),
      value: totalCloudProjects,
      to: '/backend/cloud-projects',
      search: { page: 1, viewMode: 'auto' as const },
    },
    {
      key: 'domains',
      label: t('page.dashboard.estate.domains'),
      value: totalDomains,
      to: '/backend/domain',
    },
    {
      key: 'databases',
      label: t('page.dashboard.estate.databases'),
      value: totalDatabases,
      to: '/backend/database',
    },
    {
      key: 'sshKeys',
      label: t('page.dashboard.estate.sshKeys'),
      value: totalSshKeys,
      to: '/backend/secret-managers/ssh-key',
    },
  ];

  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        <TabNav active={activeTab} isTeamWorkspace={isTeamWorkspace} />

        {activeTab === 'overview' && (
          <>
            {/* Is anything wrong? */}
            <HealthVerdict
              verdict={health.verdict}
              isLoading={health.isLoading}
              hasFailed={health.hasFailed}
              isUnauthorized={health.isUnauthorized}
              onRetry={health.refresh}
            />

            {/* The estate as one block of numbers, beside the trend. */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <KpiBlock items={estateItems} className="self-start" />
              <ActivityChart />
            </div>

            <AttentionPanel
              servers={servers}
              failures={health.failures}
              unreachableAgents={health.unreachableAgents}
              unhealthyServers={health.unhealthyServers}
              isLoading={health.isLoading}
              hasFailed={health.hasFailed}
              isUnauthorized={health.isUnauthorized}
              onRetry={health.refresh}
            />

            <FleetUtilisationPanel />
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <ActivityChart />
            <ActivityPanel hasServers={servers.length > 0} />
          </>
        )}

        {activeTab === 'resources' && (
          <>
            <FleetUtilisationPanel />

            <ServerHealthPanel
              totalServers={totalServers}
              stats={serverStats}
              servers={servers}
              reportingServerCount={reportingServerCount}
            />

            <div className="grid gap-4 xl:grid-cols-3">
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
          </>
        )}

        {activeTab === 'workspace' && (
          <>
            <WorkspaceOverview
              workspaceName={activeWorkspaceName}
              workspaceId={activeWorkspaceId ?? undefined}
              workspaceType={t('page.dashboard.workspace.team')}
              iacRepository={workspaceIacRepository}
              isIacRepositoryLoading={isPendingResponse(iacRepositoryResponse)}
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <MembersPanel members={members} totalMembers={totalMembers} />
              <CloudProjectsPanel
                cloudProjects={cloudProjects}
                servers={servers}
                totalCloudProjects={totalCloudProjects}
              />
            </div>
          </>
        )}
      </div>

      <div aria-hidden className="hidden">
        {telemetryServers.map((server) => (
          <DashboardServerTelemetryProbe
            key={`${server.id}:${probeGeneration}`}
            server={server}
            onSample={handleTelemetrySample}
          />
        ))}
      </div>
    </>
  );
}
