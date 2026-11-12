import { useEffect, useMemo, useState } from 'react';

import { ApiServer } from '@/shared/api';
import { excludeNully } from '@/shared/libs/browser/typeguards';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

const PAGE_SIZE = 3;

/**
 * Only a ready server can host an application. Filtering on the server keeps
 * every page full: dropping failed or deleted servers after paging left whole
 * pages empty while later pages still had servers to pick.
 */
export const DEPLOYABLE_SERVER_STATUS = 'ready';

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
  /**
   * Reached through its agent instead of SSH. publicIP holds its registered
   * public address when it has one (a cloud VM joined with a public IP),
   * else its LAN address.
   */
  private?: boolean;
  /** An agent-connected server whose publicIP is a public address. */
  hasPublicAddress?: boolean;
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
      status: DEPLOYABLE_SERVER_STATUS,
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
              address,
              agent_version,
              connectivity,
              lan_address,
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

            // A server reached through its agent may still have a public
            // address (a cloud VM joined with a public IP); show it, and fall
            // back to its LAN address only when it has none.
            const isPrivate = connectivity === 'private';
            const registeredAddress = address?.trim();
            const publicIP = isPrivate
              ? registeredAddress || lan_address || '-'
              : address;
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
              private: isPrivate,
              hasPublicAddress: isPrivate && !!registeredAddress,
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
