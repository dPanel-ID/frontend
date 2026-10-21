import { buildResponseView } from '@/widgets/response-view-builder';

import { DomainListState } from '../-presentation/DdnsListState';
import { useDomainDataModel } from '../../-models/domain-data';
import { useEmit } from '../../-models/events';
import { useFilterModel } from '../../-models/filters';

import DomainCompactCards from './DomainCompactCards';
import { DomainRow } from './DomainRow';
import { DomainsEmptyState } from './DomainsEmptyState';
import DomainTable from './DomainTable';

export default buildResponseView({
  useResponse: () => useDomainDataModel((s) => s.domains),
  fallbackError: DomainListState.Error,
  fallbackLoading: DomainListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const emit = useEmit();
    const [derivedViewMode, searchQuery] = useFilterModel((s) => [
      s.derivedViewMode,
      s.searchQuery,
    ]);

    if (list.length < 1) {
      return (
        <DomainsEmptyState
          filtered={Boolean(searchQuery)}
          onClearSearch={() => {
            emit('@domain-dns/filters/search--input');
            emit('@domain-dns/filters/pagination--set', 1);
          }}
        />
      );
    }

    if (derivedViewMode === 'table') {
      return <DomainTable data={list} />;
    }

    if (derivedViewMode === 'grid') {
      return <DomainCompactCards list={list} />;
    }

    return (
      <div className="flex flex-col gap-3">
        {list.map((domain) => (
          <DomainRow key={domain.id} domain={domain} />
        ))}
      </div>
    );
  },
});
