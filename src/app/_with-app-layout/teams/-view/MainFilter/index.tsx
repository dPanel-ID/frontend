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
import type { FilterRules } from '../../-rules';

const ViewModeSO = buildSegmentedControl<FilterRules.ViewMode>({
  options: [
    {
      id: 'auto',
      icon: ArrowLeftRightIcon,
      tooltipI18n: 'common.terms.automaticView',
    },
    { id: 'table', icon: TableIcon, tooltipI18n: 'common.terms.tableView' },
    { id: 'grid', icon: Grid2X2Icon, tooltipI18n: 'common.terms.cardGridView' },
  ],
});

const SlotViewMode = () => {
  const emit = useEmit();
  const [viewMode] = useFilterModel((s) => [s.viewMode]);

  return (
    <ViewModeSO
      activeItemId={viewMode}
      onClickOption={(newViewMode) =>
        emit('@teams/filters/view-mode--change', newViewMode)
      }
    />
  );
};

const SlotSearch = () => {
  const emit = useEmit();
  const t = useDevetekTranslations();
  const [searchQuery] = useFilterModel((s) => [s.searchQuery]);

  return (
    <SearchCollapsible
      initialValue={searchQuery}
      onSubmit={(input) => {
        emit('@teams/filters/search--input', input);
        emit('@teams/filters/pagination--set', 1);
      }}
      onClickClear={() => {
        emit('@teams/filters/search--input', undefined);
        emit('@teams/filters/pagination--set', 1);
      }}
      placeholderText={t('page.teams.searchPlaceholder')}
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
      onClick={() => emit('@teams/data--refresh', null)}
    >
      <RefreshCwIcon />
    </Button>
  );
};

const SlotKeywordBadge = () => {
  const emit = useEmit();
  const [searchQuery] = useFilterModel((s) => [s.searchQuery]);

  return (
    <SearchKeywordBadge
      keyword={searchQuery}
      onClear={() => {
        emit('@teams/filters/search--input', undefined);
        emit('@teams/filters/pagination--set', 1);
      }}
    />
  );
};

export default function MainFilter() {
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
      <SlotKeywordBadge />
    </>
  );
}
