import { useAuthLoggedIn } from '@/services/auth';

import { AdapterServerFromDto } from '@/entities/server/adapter';

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

  const [responseServers, refresh] = ApiServer.Find.useGet({
    filter: ownership,
    userId,
    pageSize: SERVERS_PAGE_SIZE,
    page: pagination,
    searchQuery,
    status,
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
  };
});
