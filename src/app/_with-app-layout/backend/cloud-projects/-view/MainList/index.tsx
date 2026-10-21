import { useDevetekTranslations } from '@/services/i18n';

import { buildResponseView } from '@/widgets/response-view-builder';

import { CloudListState } from '../-presentation/CloudListState';
import { toCloudProjectCard } from '../../-lib/describe-cloud-project';
import { useCloudDataModel } from '../../-model/cloud-data';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

import CloudCard from './CloudCard';
import { CloudProjectRow } from './CloudProjectRow';
import { CloudProjectsEmptyState } from './CloudProjectsEmptyState';
import CloudTable from './CloudTable';
import { useCloudProjectHandlers } from './useCloudProjectHandlers';

export default buildResponseView({
  useResponse: () => useCloudDataModel((s) => s.clouds),
  fallbackError: CloudListState.Error,
  fallbackLoading: CloudListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const t = useDevetekTranslations();
    const emit = useEmit();
    const handlersFor = useCloudProjectHandlers();
    const [derivedViewMode, searchQuery, status] = useFilterModel((s) => [
      s.derivedViewMode,
      s.searchQuery,
      s.status,
    ]);

    const cloudProjects = list.flatMap((cloud) => {
      const card = toCloudProjectCard(
        cloud,
        t('page.cloudProjects.table.account'),
        t('page.cloudProjects.card.unknownProvider'),
      );
      return card ? [card] : [];
    });

    if (cloudProjects.length < 1) {
      return (
        <CloudProjectsEmptyState
          filtered={Boolean(searchQuery || status)}
          onClearFilters={() => {
            emit('@cloud-projects/filters/pagination--set', 1);
            emit('@cloud-projects/filters/search--input', undefined);
            emit('@cloud-projects/filters/status--change', '');
          }}
          onConnect={() => emit('@cloud-projects/add-new', undefined)}
        />
      );
    }

    if (derivedViewMode === 'table') {
      return (
        <CloudTable cloudProjects={cloudProjects} handlersFor={handlersFor} />
      );
    }

    if (derivedViewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cloudProjects.map((cloudProject) => (
            <CloudCard
              key={cloudProject.id}
              cloudProject={cloudProject}
              handlers={handlersFor(cloudProject)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {cloudProjects.map((cloudProject) => (
          <CloudProjectRow
            key={cloudProject.id}
            cloudProject={cloudProject}
            handlers={handlersFor(cloudProject)}
          />
        ))}
      </div>
    );
  },
});
