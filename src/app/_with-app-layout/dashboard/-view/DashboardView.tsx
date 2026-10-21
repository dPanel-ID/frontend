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

import { countFromPagination, responseData } from '../-lib/api-response';
import {
  buildApplicationStats,
  buildLoadBalancerStats,
  buildServerStats,
} from '../-lib/stats';
import {
  MAX_HISTORY_POINTS,
  TELEMETRY_LIMIT,
  buildAggregatedTelemetry,
  buildLatestTelemetry,
} from '../-lib/telemetry';
import type { TelemetryPoint } from '../-lib/telemetry';
import {
  DEFAULT_WORKSPACE_IAC_REPOSITORY,
  buildWorkspaceIacRepository,
} from '../-lib/workspace';

import ActivityPanel from './ActivityPanel/ActivityPanel';
import ApplicationsList from './ApplicationsList/ApplicationsList';
import AttentionPanel from './AttentionPanel/AttentionPanel';
import CloudProjectsPanel from './CloudProjectsPanel/CloudProjectsPanel';
import Header from './Header';
import LoadBalancersList from './LoadBalancersList/LoadBalancersList';
import MembersPanel from './MembersPanel/MembersPanel';
import ResourceMixPanel from './ResourceMixPanel/ResourceMixPanel';
import ServerHealthPanel from './ServerHealthPanel/ServerHealthPanel';
import ServersList from './ServersList/ServersList';
import SummaryGrid from './SummaryGrid/SummaryGrid';
import DashboardServerTelemetryProbe from './TelemetryPanel/DashboardServerTelemetryProbe';
import TelemetryPanel from './TelemetryPanel/TelemetryPanel';
import WorkspaceOverview from './WorkspaceOverview/WorkspaceOverview';

const RECENT_LIST_LIMIT = 3;

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
  const [iacRepositoryResponse] = ApiModule.Repository.useGet({
    ref: DEFAULT_WORKSPACE_IAC_REPOSITORY.ref,
  });

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
  const workspaceIacRepository = buildWorkspaceIacRepository(iacRepositoryData);

  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        {/* First on the page: whether anything needs the reader's attention. */}
        <AttentionPanel servers={servers} />

        <WorkspaceOverview
          workspaceName={activeWorkspaceName}
          workspaceId={activeWorkspaceId ?? undefined}
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

            <ActivityPanel hasServers={servers.length > 0} />
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
