import { useAuthLoggedIn } from '@/services/auth';

import { AdapterServerFromDto } from '@/entities/server/adapter';
import { AGENT_CHECK_INTERVAL_MS } from '@/entities/server/lib/agentHealth';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';
import { useFilterModel } from './filters';

/** Servers per page; rich cards each poll the agent, so keep it modest. */
export const SERVERS_PAGE_SIZE = 6;

export const [ServersModelProvider, useServersModel] = buildSelector(
  'ServersModel',
)(() => {
  const { id: userId } = useAuthLoggedIn().userProfile;

  const { pagination, ownership, searchQuery, status } = useFilterModel();

  // Polled quietly while the page is open so each card's agent last-seen
  // time stays current for the "stopped reporting" warning.
  const [responseServers, refresh, serversMeta] = ApiServer.Find.useGet({
    filter: ownership,
    userId,
    pageSize: SERVERS_PAGE_SIZE,
    page: pagination,
    searchQuery,
    status,
    options: {
      refreshIntervalMs: AGENT_CHECK_INTERVAL_MS,
      silentRefresh: true,
      refetchOnVisible: true,
    },
  });

  useSubscribe('@resources::servers/servers-refresh', () => refresh());

  return {
    ...useAdapter(responseServers, (raw) => {
      const { pagination: rawPagination, machines } = raw;

      return {
        pagination: rawPagination,
        servers: (machines ?? []).map((server) =>
          AdapterServerFromDto.toServerCard(server).unwrap(),
        ),
      };
    }),
    /** When the list was last read from the API (client clock). */
    checkedAt: serversMeta.receivedAt,
  };
});
