import {
  ArrowLeftRightIcon,
  Grid2X2Icon,
  RefreshCwIcon,
  TableIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelPagination,
} from '@/shared/presentation/organisms/DataPanel';
import { buildSegmentedControl } from '@/widgets/ui-atomic-builder/atom-segmented-control';

import { useEmit } from '../../-model/events';
import { useFilterModel } from '../../-model/filters';
import { useMembersDataModel } from '../../-model/members-data';
import type { FilterRules } from '../../-rules';

import MemberList from './MemberList';

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

/** Everyone in the team, in the standard data panel. */
export default function MembersPanel() {
  const emit = useEmit();
  const t = useDevetekTranslations('page.teamDetail');
  const [viewMode, currentPage] = useFilterModel((s) => [
    s.viewMode,
    s.currentPage,
  ]);
  const { members } = useMembersDataModel();

  const team = members.$status === 'success' ? members : undefined;

  return (
    <DataPanel
      icon={UsersIcon}
      title={t('membersTitle')}
      description={t('membersDescription')}
      actions={
        <>
          <Button
            size="icon-sm"
            buttonColor="secondary"
            buttonStyle="outline"
            aria-label={t('refreshMembers')}
            title={t('refreshMembers')}
            onClick={() => emit('@team-members/data--refresh', null)}
          >
            <RefreshCwIcon />
          </Button>
          <ViewModeSO
            activeItemId={viewMode}
            onClickOption={(next) =>
              emit('@team-members/filters/view-mode--change', next)
            }
          />
        </>
      }
      footer={
        team && (
          <>
            <DataPanelMeta>
              {t('showing', { shown: team.list.length, total: team.total })}
            </DataPanelMeta>
            <DataPanelPagination
              page={currentPage}
              totalPage={team.pagination.total_page}
              onPageChange={(page) =>
                emit('@team-members/filters/pagination--set', page)
              }
            />
          </>
        )
      }
    >
      <MemberList />
    </DataPanel>
  );
}
