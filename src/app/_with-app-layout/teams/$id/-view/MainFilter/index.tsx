import {
  ArrowLeftRightIcon,
  Grid2X2Icon,
  RefreshCwIcon,
  TableIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
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
        emit('@team-members/filters/view-mode--change', newViewMode)
      }
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
      onClick={() => emit('@team-members/data--refresh', null)}
      aria-label={t('page.teamDetail.refreshMembers')}
      title={t('page.teamDetail.refreshMembers')}
    >
      <RefreshCwIcon />
    </Button>
  );
};

export default function MainFilter() {
  return (
    <Card className="bg-card/30 rounded-lg p-1.5 flex items-center justify-end gap-x-1">
      <SlotRefresh />
      <SlotViewMode />
    </Card>
  );
}
