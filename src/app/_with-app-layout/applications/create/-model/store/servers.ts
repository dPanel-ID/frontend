import { useEffect, useMemo, useState } from 'react';

import { ApiServer } from '@/shared/api';
import { excludeNully } from '@/shared/libs/browser/typeguards';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

const PAGE_SIZE = 3;

export interface ApplicationCreateServerOption {
  id: number;
  hostname: string;
  publicIP: string;
  agentVersion?: string;
  defaultUser?: string;
  domain?: string;
  error?: string;
  inventoryRefreshedAt?: string;
  osName?: string;
  osVersion?: string;
  provider?: string;
  region?: string;
  sshPort?: string;
  status?: string;
}

interface ServersStoreProviderProps {
  initialServers?: ApplicationCreateServerOption[];
}

export const [ServersStoreProvider, useServersStore] = buildContext(
  'ApplicationsCreateServersStore',
  (props: ServersStoreProviderProps = {}) => {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [knownServersById, setKnownServersById] = useState<
      Record<number, ApplicationCreateServerOption>
    >(() => {
      return (props.initialServers ?? []).reduce<
        Record<number, ApplicationCreateServerOption>
      >((acc, server) => {
        acc[server.id] = server;
        return acc;
      }, {});
    });

    const [responseServers, refresh] = ApiServer.Find.useGet({
      pageSize: PAGE_SIZE,
      page,
      searchQuery: searchQuery || undefined,
    });

    const servers = useMemo(() => {
      if (responseServers.$status !== 'success') return responseServers;

      const { machines, pagination } = responseServers;

      return {
        $status: 'success' as const,
        servers: (machines ?? [])
          .map((machine) => {
            const {
              address: publicIP,
              agent_version,
              default_user,
              domain,
              distributor,
              error,
              hostname,
              id,
              inventory_refreshed_at,
              os_family,
              provider,
              region,
              ssh_port,
              status,
              version,
            } = machine;

            const serverId = Number(id);
            if (!Number.isFinite(serverId) || !hostname || !publicIP) {
              return null;
            }

            return {
              id: serverId,
              hostname,
              publicIP,
              agentVersion: agent_version,
              defaultUser: default_user,
              domain,
              error,
              inventoryRefreshedAt: inventory_refreshed_at,
              osName: distributor ?? os_family,
              osVersion: version,
              provider,
              region,
              sshPort: ssh_port,
              status,
            } satisfies ApplicationCreateServerOption;
          })
          .filter(excludeNully),
        totalPage: Math.max(1, pagination.total_page),
      };
    }, [responseServers]);

    useEffect(() => {
      if (servers.$status !== 'success') return;

      setKnownServersById((current) => {
        const next = { ...current };
        for (const server of servers.servers) {
          next[server.id] = server;
        }
        return next;
      });
    }, [servers]);

    return [
      servers,
      { knownServersById, page, refresh, setPage, searchQuery, setSearchQuery },
    ] as const;
  },
);
