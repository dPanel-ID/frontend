import { useMemo } from 'react';

import type { ServerCard as ServerCardModel } from '@/entities/server/rules/schema';

import { ApiApplication } from '@/shared/api';
import type { Response } from '@/shared/libs/api-client/rules/types';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';

import { useFilterModel } from '../../-model/filters';
import { useServersModel } from '../../-model/servers';
import { ServerListState } from '../_presentation/ServerListState';

import ServerCard from './ServerCard';
import { ServerCompactCard } from './ServerCompactCard';
import { ServersEmptyState } from './ServersEmptyState';
import { ServerTable } from './ServerTable';
import { useServerHandlers } from './useServerHandlers';

type ServersData = {
  servers: ServerCardModel[];
};

const [guard, useServers] = guardedSelects({
  fallbackLoading: ServerListState.Loading,
  fallbackError: ServerListState.Error,
})(
  couple(
    useServersModel,
    (source): Response<ServersData> => source as Response<ServersData>,
  ),
);

export default guard(function ServerList() {
  const isDesktop = useBreakpoint('lg');
  const handlersFor = useServerHandlers();

  const [servers] = useServers((s) => [s.servers]);
  const {
    viewMode,
    searchQuery,
    status,
    setSearchQuery,
    setStatus,
    setPagination,
  } = useFilterModel();

  const [applicationsResponse] = ApiApplication.Find.useGet({
    page: 1,
    limit: 12,
    options: {
      skip: servers.length < 1,
    },
  });

  const applicationsData = responseData(applicationsResponse);
  const applicationCountByServerId = useMemo(() => {
    const counts = new Map<string, number>();

    for (const application of applicationsData?.applications ?? []) {
      const serverIds = new Set(
        application.deploys
          ?.map((deployment) => String(deployment.machine_id))
          .filter(Boolean),
      );

      for (const serverId of serverIds) {
        counts.set(serverId, (counts.get(serverId) ?? 0) + 1);
      }
    }

    return counts;
  }, [applicationsData]);

  const resolvedViewMode =
    viewMode === 'auto' ? (isDesktop ? 'list' : 'grid') : viewMode;

  if (servers.length < 1) {
    return (
      <ServersEmptyState
        filtered={Boolean(searchQuery || status)}
        onClearFilters={() => {
          setPagination(1);
          setSearchQuery('');
          setStatus('');
        }}
      />
    );
  }

  if (resolvedViewMode === 'table') {
    return <ServerTable servers={servers} handlersFor={handlersFor} />;
  }

  if (resolvedViewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {servers.map((server) => (
          <ServerCompactCard
            key={server.id}
            server={server}
            handlers={handlersFor(server)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {servers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          handlers={handlersFor(server)}
          applicationCount={applicationCountByServerId.get(server.id) ?? 0}
        />
      ))}
    </div>
  );
});

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}
