import { useMemo } from 'react';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import { isMigrateOwnershipVisible } from '@/features/migrate-ownership-modal';

import { ApiLoadBalancer } from '@/shared/api';
import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import { buildResponseView } from '@/widgets/response-view-builder';

import { AppListState } from '../-presentation/AppListState';
import { indexLoadBalancersByApplication } from '../../-lib/load-balancer-index';
import { useAppsDataModel } from '../../-model/apps-data';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

import AppCard from './AppCard';
import AppRow from './AppRow';
import { AppsEmptyState } from './AppsEmptyState';
import AppTable from './AppTable';
import type { AppTableHandlers } from './AppTable';

export default buildResponseView({
  useResponse: () => useAppsDataModel((s) => s.applications),
  fallbackError: AppListState.Error,
  fallbackLoading: AppListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const emit = useEmit();
    const isDesktop = useBreakpoint('lg');

    // One lookup for the page, the way the servers list counts
    // applications. A router has no application id of its own, so the
    // mapping comes from its rules.
    const [loadBalancersResponse] = ApiLoadBalancer.Find.useGet({
      page: 1,
      limit: 100,
      options: { skip: list.length < 1 },
    });

    const loadBalancersByApp = useMemo(() => {
      const routers =
        loadBalancersResponse.$status === 'success'
          ? loadBalancersResponse.routers
          : loadBalancersResponse.$status === 'loading'
            ? loadBalancersResponse.prevData?.routers
            : undefined;

      return indexLoadBalancersByApplication(routers);
    }, [loadBalancersResponse]);
    const { searchQuery, setSearchQuery, setPagination, viewMode } =
      useFilterModel();

    const derivedViewMode =
      viewMode === 'auto' ? (isDesktop ? 'list' : 'grid') : viewMode;

    const handlersFor = (application: ApplicationCard): AppTableHandlers => ({
      edit: () => emit('@applications/application-edit', application),
      migrateOwnership: isMigrateOwnershipVisible()
        ? () => emit('@applications/open--migrate-ownership', application)
        : undefined,
      remove: () =>
        emit('@applications/application-delete', {
          appName: application.identity.name,
          id: application.id,
        }),
    });

    if (list.length < 1) {
      return (
        <AppsEmptyState
          filtered={Boolean(searchQuery)}
          onClearSearch={() => {
            setPagination(1);
            setSearchQuery('');
          }}
        />
      );
    }

    if (derivedViewMode === 'table') {
      return (
        <AppTable
          list={list}
          handlersFor={handlersFor}
          loadBalancersByApp={loadBalancersByApp}
        />
      );
    }

    if (derivedViewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((application) => {
            const handlers = handlersFor(application);

            return (
              <AppCard
                key={application.id}
                data={application}
                loadBalancers={loadBalancersByApp.get(String(application.id))}
                onClickEdit={handlers.edit}
                onClickMigrateOwnership={handlers.migrateOwnership}
                onClickDelete={handlers.remove}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {list.map((application) => {
          const handlers = handlersFor(application);

          return (
            <AppRow
              key={application.id}
              data={application}
              loadBalancers={loadBalancersByApp.get(String(application.id))}
              onClickEdit={handlers.edit}
              onClickMigrateOwnership={handlers.migrateOwnership}
              onClickDelete={handlers.remove}
            />
          );
        })}
      </div>
    );
  },
});
