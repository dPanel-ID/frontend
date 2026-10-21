import {
  ArrowLeftRightIcon,
  Grid2X2Icon,
  RefreshCwIcon,
  TableIcon,
  XIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import SearchCollapsible from '@/shared/presentation/atoms/SearchCollapsible';
import SearchKeywordBadge from '@/shared/presentation/atoms/SearchKeywordBadge';
import { buildSegmentedControl } from '@/widgets/ui-atomic-builder/atom-segmented-control';

import { useEmit } from '../../-models/events';
import { useFilterModel } from '../../-models/filters';
import type { FilterRules } from '../../-rules';

const ViewModeSO = buildSegmentedControl<FilterRules.ViewMode>({
  options: [
    {
      id: 'auto',
      icon: ArrowLeftRightIcon,
      tooltipI18n: 'common.terms.automaticView',
    },
    {
      id: 'grid',
      icon: Grid2X2Icon,
      tooltipI18n: 'common.terms.cardGridView',
    },
    {
      id: 'table',
      icon: TableIcon,
      tooltipI18n: 'common.terms.tableView',
    },
  ],
});

const SlotViewMode = () => {
  const emit = useEmit();
  const [viewMode] = useFilterModel((s) => [s.viewMode]);

  return (
    <ViewModeSO
      activeItemId={viewMode}
      onClickOption={(newViewMode) => {
        emit('@load-balancers/filters/view-mode--change', newViewMode);
      }}
    />
  );
};

const SlotSearchCollapsible = () => {
  const t = useDevetekTranslations();

  const emit = useEmit();
  const [searchQuery] = useFilterModel((s) => [s.searchQuery]);

  const handleSearch = (input: string) => {
    emit('@load-balancers/filters/search--input', input);
    emit('@load-balancers/filters/pagination--set', 1);
  };

  const handleClear = () => {
    emit('@load-balancers/filters/search--input');
    emit('@load-balancers/filters/pagination--set', 1);
  };

  return (
    <SearchCollapsible
      initialValue={searchQuery}
      onSubmit={handleSearch}
      onClickClear={handleClear}
      placeholderText={t('page.loadBalancers.filters.searchPlaceholder')}
    />
  );
};

const SlotActiveFilters = () => {
  const emit = useEmit();
  const t = useDevetekTranslations();
  const [searchQuery, status] = useFilterModel((s) => [
    s.searchQuery,
    s.status,
  ]);

  if (!searchQuery && !status) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchQuery && (
        <SearchKeywordBadge
          keyword={searchQuery}
          onClear={() => {
            emit('@load-balancers/filters/search--input');
            emit('@load-balancers/filters/pagination--set', 1);
          }}
        />
      )}
      {status && (
        <button
          type="button"
          onClick={() => {
            emit('@load-balancers/filters/pagination--set', 1);
            emit('@load-balancers/filters/status--change', '');
          }}
          className="inline-flex max-w-fit items-center gap-x-1.5 rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[0.7rem] text-sky-700 transition-colors hover:bg-sky-500/15 dark:text-sky-300"
        >
          <span>{t('page.loadBalancers.filters.status')}</span>
          <span className="font-semibold">
            {t(`page.loadBalancers.overview.${status}`)}
          </span>
          <XIcon className="size-3" />
        </button>
      )}
    </div>
  );
};

const SlotRefresh = () => {
  const emit = useEmit();
  const t = useDevetekTranslations();

  return (
    <Button
      size="icon-sm"
      buttonColor="secondary"
      buttonStyle="ghost"
      aria-label={t('common.actions.refresh')}
      title={t('common.actions.refresh')}
      onClick={() => emit('@load-balancers/data--refresh', null)}
    >
      <RefreshCwIcon />
    </Button>
  );
};

export default function MainFilter() {
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-x-2 rounded-xl border bg-card/40 p-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <SlotSearchCollapsible />
        </div>

        <div className="flex items-center gap-x-1">
          <SlotRefresh />
          <SlotViewMode />
        </div>
      </div>
      <SlotActiveFilters />
    </>
  );
}
