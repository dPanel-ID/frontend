import { useMemo } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import type { ServerCard as ServerCardModel } from '@/entities/server/rules/schema';

import { ApiApplication } from '@/shared/api';
import type { Response } from '@/shared/libs/api-client/rules/types';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';

import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useServersModel } from '../../-model/servers';
import { ServerListState } from '../_presentation/ServerListState';

import ServerCard from './ServerCard';

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
  const navigate = useNavigate();
  const emit = useEmit();
  const t = useDevetekTranslations();

  const isDesktop = useBreakpoint('lg');

  const [servers] = useServers((s) => [s.servers]);
  const { viewMode } = useFilterModel();

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

  const derivedViewMode: 'grid' | 'list' =
    viewMode === 'auto' ? (isDesktop ? 'list' : 'grid') : viewMode;

  if (servers.length < 1) {
    return (
      <EmptyState
        title={t('page.servers.emptyState.title')}
        message={t('page.servers.emptyState.message')}
        ctaText={t('page.servers.emptyState.cta')}
        ctaOnClick={() =>
          navigate({
            to: '/servers/create',
          })
        }
      />
    );
  }

  return (
    <LayoutAutoGridList viewMode={viewMode}>
      {servers.map((server: ServerCardModel) => {
        const handleClickEdit = () => {
          emit('@resources::servers/server-edit-sidepanel', server);
        };

        const handleClickReinstall = () => {
          emit('@resources::servers/machine-reinstall', {
            serverId: server.id,
          });
        };

        const handleClickMigrateOwnership = () => {
          return () => {
            if (!server.host.name) return undefined;

            emit('@resources::servers/server-migrate-ownership', {
              serverId: server.id,
              serverName: server.host.name,
              serverTeam: server.ownership.team,
            });
          };
        };

        const handleClickDelete = () => {
          emit('@resources::servers/machine-delete', {
            serverId: server.id,
            serverName: server.host.name,
          });
        };

        const handleClickStatus = () => {
          emit('@resources::servers/server-status-info-dialog', server);
        };

        return (
          <ServerCard
            key={server.id}
            variant={derivedViewMode === 'list' ? 'full' : 'compact'}
            data={server}
            applicationCount={applicationCountByServerId.get(server.id) ?? 0}
            onClickEdit={handleClickEdit}
            onClickReinstall={handleClickReinstall}
            onClickMigrateOwnership={handleClickMigrateOwnership()}
            onClickDelete={handleClickDelete}
            onClickStatus={handleClickStatus}
          />
        );
      })}
    </LayoutAutoGridList>
  );
});

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}
