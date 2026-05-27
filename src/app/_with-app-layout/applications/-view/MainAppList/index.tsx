import { useNavigate, useRouter } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { AppListState } from '../-presentation/AppListState';
import { useAppsDataModel } from '../../-model/apps-data';
import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

import AppCard from './AppCard';

export default buildResponseView({
  useResponse: () => useAppsDataModel((s) => s.applications),
  fallbackError: AppListState.Error,
  fallbackLoading: AppListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const navigate = useNavigate();
    const router = useRouter();
    const t = useDevetekTranslations();
    const emit = useEmit();

    const isDesktop = useBreakpoint('lg');
    const { viewMode } = useFilterModel();

    const derivedViewMode =
      viewMode !== 'auto' ? viewMode : isDesktop ? 'list' : 'grid';

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.applications.emptyState.title')}
          message={t('page.applications.emptyState.message')}
          ctaText={t('page.applications.emptyState.cta')}
          ctaOnClick={() =>
            navigate({
              to: '/applications/create',
            })
          }
        />
      );
    }

    const renderApplicationCard = (application: ApplicationCard) => {
      const handleClickDetails = () => {
        const { id } = application;
        const href = router.buildLocation({
          to: '/applications/$id',
          params: { id: String(id) },
        }).href;
        window.open(href, '_blank', 'noopener,noreferrer');
      };

      const handleClickEdit = () => {
        emit('@applications/application-edit', application);
      };

      const handleClickMigrateOwnership = () => {
        emit('@applications/open--migrate-ownership', application);
      };

      const handleClickDelete = () => {
        emit('@applications/application-delete', {
          appName: application.identity.name,
          id: application.id,
        });
      };

      return (
        <AppCard
          key={application.id}
          variant={derivedViewMode === 'grid' ? 'compact' : 'full'}
          data={application}
          onClickEdit={handleClickEdit}
          onClickDetails={handleClickDetails}
          onClickMigrateOwnership={handleClickMigrateOwnership}
          onClickDelete={handleClickDelete}
        />
      );
    };

    if (derivedViewMode === 'list') {
      return (
        <div className="pb-2 overflow-x-auto">
          <div className="min-w-[980px] overflow-hidden rounded-xl border bg-card/30">
            <div className="grid grid-cols-[minmax(280px,1.6fr)_minmax(190px,1fr)_minmax(170px,0.8fr)_minmax(170px,0.85fr)_88px] items-center gap-4 border-b px-4 py-3 text-xs font-bold uppercase text-primary/60">
              <p>{t('common.terms.application')}</p>
              <p>{t('common.terms.server')}</p>
              <p>{t('common.terms.bundleType')}</p>
              <p>{t('common.terms.status')}</p>
              <p className="text-right">{t('common.terms.actions')}</p>
            </div>

            <div className="divide-y">{list.map(renderApplicationCard)}</div>
          </div>
        </div>
      );
    }

    return (
      <LayoutAutoGridList viewMode={viewMode}>
        {list.map((application: ApplicationCard) => {
          return renderApplicationCard(application);
        })}
      </LayoutAutoGridList>
    );
  },
});
