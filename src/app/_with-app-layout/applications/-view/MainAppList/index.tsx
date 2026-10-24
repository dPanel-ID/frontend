import { useRouter } from '@tanstack/react-router';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import { buildResponseView } from '@/widgets/response-view-builder';

import { AppListState } from '../-presentation/AppListState';
import { useAppsDataModel } from '../../-model/apps-data';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

import AppCard from './AppCard';
import { AppsEmptyState } from './AppsEmptyState';
import AppTable from './AppTable';
import type { AppTableHandlers } from './AppTable';

export default buildResponseView({
  useResponse: () => useAppsDataModel((s) => s.applications),
  fallbackError: AppListState.Error,
  fallbackLoading: AppListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const router = useRouter();
    const emit = useEmit();
    const isDesktop = useBreakpoint('lg');
    const { searchQuery, setSearchQuery, setPagination, viewMode } =
      useFilterModel();

    const derivedViewMode =
      viewMode === 'grid'
        ? 'grid'
        : viewMode === 'table'
          ? 'table'
          : isDesktop
            ? 'table'
            : 'grid';

    const handlersFor = (application: ApplicationCard): AppTableHandlers => ({
      openDetails: () => {
        const href = router.buildLocation({
          to: '/applications/$id',
          params: { id: String(application.id) },
        }).href;
        window.open(href, '_blank', 'noopener,noreferrer');
      },
      edit: () => emit('@applications/application-edit', application),
      migrateOwnership: () =>
        emit('@applications/open--migrate-ownership', application),
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
      return <AppTable list={list} handlersFor={handlersFor} />;
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((application) => {
          const handlers = handlersFor(application);

          return (
            <AppCard
              key={application.id}
              variant="compact"
              data={application}
              onClickEdit={handlers.edit}
              onClickDetails={handlers.openDetails}
              onClickMigrateOwnership={handlers.migrateOwnership}
              onClickDelete={handlers.remove}
            />
          );
        })}
      </div>
    );
  },
});
