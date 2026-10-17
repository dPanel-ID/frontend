import {
  ArrowLeftRightIcon,
  Grid2X2Icon,
  RefreshCwIcon,
  Rows3Icon,
  TableIcon,
  XIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import SearchCollapsible from '@/shared/presentation/atoms/SearchCollapsible';
import SearchKeywordBadge from '@/shared/presentation/atoms/SearchKeywordBadge';
import { buildSegmentedControl } from '@/widgets/ui-atomic-builder/atom-segmented-control';

import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import type { ServerViewMode } from '../../-model/filters';

const ViewModeSO = buildSegmentedControl<ServerViewMode>({
  options: [
    {
      id: 'auto',
      icon: ArrowLeftRightIcon,
      tooltipI18n: 'common.terms.automaticView',
    },
    {
      id: 'list',
      icon: Rows3Icon,
      tooltipI18n: 'common.terms.cardListView',
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
      onClick={() => emit('@resources::servers/servers-refresh', null)}
    >
      <RefreshCwIcon />
    </Button>
  );
};

const SlotSearch = () => {
  const t = useDevetekTranslations();
  const { searchQuery, setSearchQuery, setPagination } = useFilterModel();

  return (
    <SearchCollapsible
      initialValue={searchQuery}
      onSubmit={(input) => {
        setPagination(1);
        setSearchQuery(input);
      }}
      onClickClear={() => {
        setPagination(1);
        setSearchQuery('');
      }}
      placeholderText={t('page.servers.filters.searchPlaceholder')}
    />
  );
};

const SlotActiveFilters = () => {
  const t = useDevetekTranslations();
  const { searchQuery, setSearchQuery, status, setStatus, setPagination } =
    useFilterModel();

  if (!searchQuery && !status) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchKeywordBadge
        keyword={searchQuery}
        onClear={() => {
          setPagination(1);
          setSearchQuery('');
        }}
      />
      {status && (
        <button
          type="button"
          onClick={() => {
            setPagination(1);
            setStatus('');
          }}
          className="inline-flex max-w-fit items-center gap-x-1.5 rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[0.7rem] text-sky-700 transition-colors hover:bg-sky-500/15 dark:text-sky-300"
        >
          <span>{t('page.servers.filters.status')}</span>
          <span className="font-semibold">
            {t(`page.servers.overview.${status}`)}
          </span>
          <XIcon className="size-3" />
        </button>
      )}
    </div>
  );
};

export default function FilterBar() {
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] gap-x-2 rounded-xl border bg-card/40 p-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <SlotSearch />
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
