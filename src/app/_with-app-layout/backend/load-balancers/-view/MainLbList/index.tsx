import { useDevetekTranslations } from '@/services/i18n';

import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { LbListState } from '../-presentation/LbListState';
import { useEmit } from '../../-models/events';
import { useFilterModel } from '../../-models/filters';
import { useLbDataModel } from '../../-models/lb-data';

import LbCard from './LbCard';

export default buildResponseView({
  useResponse: () => useLbDataModel((s) => s.loadBalancers),
  fallbackError: LbListState.Error,
  fallbackLoading: LbListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const t = useDevetekTranslations();

    const emit = useEmit();

    const [viewMode, derivedViewMode] = useFilterModel((s) => [
      s.viewMode,
      s.derivedViewMode,
    ]);

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.loadBalancers.emptyState.title')}
          message={t('page.loadBalancers.emptyState.message')}
          ctaText={t('page.loadBalancers.emptyState.cta')}
          ctaOnClick={() => emit('@load-balancers/open--create', null)}
        />
      );
    }

    const renderLoadBalancerCard = (loadBalancer: (typeof list)[number]) => (
      <LbCard
        key={loadBalancer.id}
        data={loadBalancer}
        variant={derivedViewMode === 'grid' ? 'compact' : 'full'}
        onClickDetails={() =>
          emit('@load-balancers/open--details', loadBalancer)
        }
        onClickDelete={() => {
          emit('@load-balancers/lb--delete', loadBalancer);
        }}
        onClickRestore={() => {
          emit('@load-balancers/lb--restore', loadBalancer);
        }}
      />
    );

    if (derivedViewMode === 'list') {
      return (
        <div className="pb-2 overflow-x-auto">
          <div className="min-w-[1080px] overflow-hidden rounded-xl border bg-card/30">
            <div className="grid grid-cols-[minmax(280px,1.45fr)_minmax(220px,1fr)_minmax(220px,1fr)_minmax(180px,0.85fr)_88px] items-center gap-4 border-b px-4 py-3 text-xs font-bold uppercase text-primary/60">
              <p>{t('page.loadBalancers.table.loadBalancer')}</p>
              <p>{t('page.loadBalancers.table.gateway')}</p>
              <p>{t('page.loadBalancers.table.routing')}</p>
              <p>{t('common.terms.status')}</p>
              <p className="text-right">{t('common.terms.actions')}</p>
            </div>

            <div className="divide-y">{list.map(renderLoadBalancerCard)}</div>
          </div>
        </div>
      );
    }

    return (
      <LayoutAutoGridList viewMode={viewMode}>
        {list.map(renderLoadBalancerCard)}
      </LayoutAutoGridList>
    );
  },
});
