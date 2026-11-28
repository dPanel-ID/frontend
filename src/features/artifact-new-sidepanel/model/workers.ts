import { useState } from 'react';

import { ApiServer } from '@/shared/api';
import type { Dto as ServerFindDto } from '@/shared/api/server.find';
import { useAdapter } from '@/shared/libs/api-client';
import { excludeNully } from '@/shared/libs/browser/typeguards';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

export interface DeploymentTargetOption {
  id: string;
  hostname: string;
  address?: string;
  defaultUser?: string;
  hostGroupId?: string;
  /** Reached through its agent instead of SSH. */
  private?: boolean;
  provider?: string;
  region?: string;
  sshPort?: string;
  status?: string;
  system?: string;
}

export interface DeploymentTargetsData {
  pagination: ServerFindDto['pagination'];
  servers: DeploymentTargetOption[];
}

type ServerItem = NonNullable<ServerFindDto['machines']>[number];

/**
 * One server as a deployment target card shows it. A server reached through
 * its agent is marked private: it has no SSH login to show.
 */
export function toDeploymentTargetOption(
  server: ServerItem,
): DeploymentTargetOption | null {
  if (!server.id) return null;

  const system = [server.distributor ?? server.os_family, server.version]
    .filter(Boolean)
    .join(' ');

  return {
    id: String(server.id),
    hostname: server.hostname || `Server ${server.id}`,
    address: server.address || server.domain,
    defaultUser: server.default_user,
    hostGroupId: server.host_group_id || undefined,
    private: server.connectivity === 'private',
    provider: server.provider,
    region: server.region,
    sshPort: server.ssh_port,
    status: server.status,
    system,
  };
}

export const [WorkersModelProvider, useWorkersModel] = buildSelector(
  'WorkersModel',
)(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Only ready servers can take a release; deleted ones keep their record
  // and must not be offered as targets.
  const [responseWorkers, refreshWorkers] = ApiServer.Find.useGet({
    status: 'ready',
    searchQuery,
    page,
    pageSize: 3,
  });

  useSubscribe('#artifact-new-sidepanel/workers-refresh', () => {
    refreshWorkers();
  });

  const adapterWorkers = (raw: ServerFindDto): DeploymentTargetsData => {
    const { pagination, machines } = raw;

    return {
      pagination,
      servers: (machines ?? [])
        .map(toDeploymentTargetOption)
        .filter(excludeNully),
    };
  };

  return {
    workers: useAdapter(responseWorkers, adapterWorkers),
    search: {
      query: searchQuery,
      setQuery: (q: string) => {
        setSearchQuery(q);
        setPage(1);
      },
    },
    pagination: {
      page,
      setPage,
    },
  };
});
