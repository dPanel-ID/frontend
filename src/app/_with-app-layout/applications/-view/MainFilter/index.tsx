import {
  ArrowLeftRightIcon,
  Grid2X2Icon,
  RefreshCwIcon,
  TableIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import SearchCollapsible from '@/shared/presentation/atoms/SearchCollapsible';
import SearchKeywordBadge from '@/shared/presentation/atoms/SearchKeywordBadge';
import { buildSegmentedControl } from '@/widgets/ui-atomic-builder/atom-segmented-control';

import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';

const ViewModeSO = buildSegmentedControl<'auto' | 'grid' | 'table'>({
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
  const { viewMode, setViewMode } = useFilterModel();

  return (
    <ViewModeSO
      activeItemId={viewMode}
      onClickOption={(newViewMode) => setViewMode(newViewMode)}
    />
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
      onClick={() => emit('@applications/application-refresh', null)}
    >
      <RefreshCwIcon />
    </Button>
  );
};

const SlotSearchCollapsible = () => {
  const t = useDevetekTranslations();

  const { searchQuery, setSearchQuery, setPagination } = useFilterModel();

  const handleSearch = (input: string) => {
    setPagination(1);
    setSearchQuery(input);
  };

  const handleClear = () => {
    setPagination(1);
    setSearchQuery('');
  };

  return (
    <SearchCollapsible
      initialValue={searchQuery}
      onSubmit={handleSearch}
      onClickClear={handleClear}
      placeholderText={t('page.applications.filters.searchPlaceholder')}
    />
  );
};

const SlotKeywordBadge = () => {
  const { searchQuery, setSearchQuery, setPagination } = useFilterModel();

  if (!searchQuery) return null;

  return (
    <SearchKeywordBadge
      keyword={searchQuery}
      onClear={() => {
        setPagination(1);
        setSearchQuery('');
      }}
    />
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
      <SlotKeywordBadge />
    </>
  );
}
