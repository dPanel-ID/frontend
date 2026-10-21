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
  toEstateStatus,
} from '../-lib/stats';
import { TELEMETRY_LIMIT, TELEMETRY_POLL_SECONDS } from '../-lib/telemetry';
import type { TelemetrySample } from '../-lib/telemetry';
import { buildWorkspaceIacRepository } from '../-lib/workspace';
import { useDashboardHealth } from '../-usecase/use-dashboard-health';

import ActivityPanel from './ActivityPanel/ActivityPanel';
import ApplicationsList from './ApplicationsList/ApplicationsList';
import AttentionPanel from './AttentionPanel/AttentionPanel';
import CapacityPanel from './CapacityPanel/CapacityPanel';
import DashboardServerTelemetryProbe from './CapacityPanel/DashboardServerTelemetryProbe';
import CloudProjectsPanel from './CloudProjectsPanel/CloudProjectsPanel';
import EstatePanel from './EstatePanel/EstatePanel';
import Header from './Header';
import HealthVerdict from './HealthVerdict/HealthVerdict';
import LoadBalancersList from './LoadBalancersList/LoadBalancersList';
import MembersPanel from './MembersPanel/MembersPanel';
import ResourceMixPanel from './ResourceMixPanel/ResourceMixPanel';
import ServerHealthPanel from './ServerHealthPanel/ServerHealthPanel';
import ServersList from './ServersList/ServersList';
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
  const [probeGeneration, setProbeGeneration] = useState(0);

  const handleTelemetrySample = useCallback((sample: TelemetrySample) => {
    setSamplesByServerId((current) => ({
      ...current,
      [sample.serverId]: sample,
    }));
  }, []);

  // Remounting the probes is how a retry refetches: each one owns its own
  // requests, so there is no single refresh handle to call.
  const handleTelemetryRetry = useCallback(() => {
    setSamplesByServerId({});
    setProbeGeneration((generation) => generation + 1);
  }, []);

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

  return (
    <>
      <Header />

      <div className="flex flex-col gap-4">
        {/* Is anything wrong? */}
        <HealthVerdict
          verdict={health.verdict}
          isLoading={health.isLoading}
          hasFailed={health.hasFailed}
          isUnauthorized={health.isUnauthorized}
          onRetry={health.refresh}
        />

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

        {/* What changed? */}
        <ActivityPanel hasServers={servers.length > 0} />

        <CapacityPanel
          samples={samples}
          sampledServerCount={telemetryServers.length}
          totalReadyServers={serverStats.ready}
          pollSeconds={TELEMETRY_POLL_SECONDS}
          onRetry={handleTelemetryRetry}
        />

        {/* What do I have? */}
        <EstatePanel
          servers={toEstateStatus(serverStats, servers.length, totalServers)}
          applications={toEstateStatus(
            applicationStats,
            applications.length,
            totalApplications,
          )}
          loadBalancers={toEstateStatus(
            loadBalancerStats,
            loadBalancers.length,
            totalLoadBalancers,
          )}
          totalDomains={totalDomains}
          totalDatabases={totalDatabases}
          totalSshKeys={totalSshKeys}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <ServerHealthPanel
              totalServers={totalServers}
              stats={serverStats}
              servers={servers}
              reportingServerCount={reportingServerCount}
            />

            {/* Configuration, not status: it sits below everything that is. */}
            <WorkspaceOverview
              workspaceName={activeWorkspaceName}
              workspaceId={activeWorkspaceId ?? undefined}
              workspaceType={
                isTeamWorkspace
                  ? t('page.dashboard.workspace.team')
                  : t('page.dashboard.workspace.personal')
              }
              iacRepository={workspaceIacRepository}
              isIacRepositoryLoading={isPendingResponse(iacRepositoryResponse)}
            />

            <CloudProjectsPanel
              cloudProjects={cloudProjects}
              servers={servers}
              totalCloudProjects={totalCloudProjects}
            />
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
            key={`${server.id}:${probeGeneration}`}
            server={server}
            onSample={handleTelemetrySample}
          />
        ))}
      </div>
    </>
  );
}
