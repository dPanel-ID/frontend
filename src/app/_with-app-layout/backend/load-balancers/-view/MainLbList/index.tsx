import { buildResponseView } from '@/widgets/response-view-builder';

import { LbListState } from '../-presentation/LbListState';
import { useEmit } from '../../-models/events';
import { useFilterModel } from '../../-models/filters';
import { useLbDataModel } from '../../-models/lb-data';

import LbCard from './LbCard';
import { LbEmptyState } from './LbEmptyState';
import LbTable from './LbTable';

export default buildResponseView({
  useResponse: () => useLbDataModel((s) => s.loadBalancers),
  fallbackError: LbListState.Error,
  fallbackLoading: LbListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const emit = useEmit();
    const [derivedViewMode, searchQuery, status] = useFilterModel((s) => [
      s.derivedViewMode,
      s.searchQuery,
      s.status,
    ]);

    if (list.length < 1) {
      return (
        <LbEmptyState
          filtered={Boolean(searchQuery || status)}
          onClearFilters={() => {
            emit('@load-balancers/filters/pagination--set', 1);
            emit('@load-balancers/filters/search--input');
            emit('@load-balancers/filters/status--change', '');
          }}
          onCreate={() => emit('@load-balancers/open--create', null)}
        />
      );
    }

    if (derivedViewMode === 'table') {
      return <LbTable list={list} />;
    }

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((loadBalancer) => (
          <LbCard
            key={loadBalancer.id}
            data={loadBalancer}
            variant="compact"
            onClickDetails={() =>
              emit('@load-balancers/open--details', loadBalancer)
            }
            onClickDelete={() =>
              emit('@load-balancers/lb--delete', loadBalancer)
            }
            onClickMigrateOwnership={() =>
              emit('@load-balancers/open--migrate-ownership', loadBalancer)
            }
          />
        ))}
      </div>
    );
  },
});
