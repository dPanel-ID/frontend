import dayjs from 'dayjs';

import { useDevetekTranslations } from '@/services/i18n';

import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { SshListState } from '../-presentation/SshListState';
import { useFilterModel } from '../../-model/filters';
import { useSshKeyDataModel } from '../../-model/ssh-key-data';

import SshCard from './SshCard';
import SshTable from './SshTable';
import type { SshTableData } from './SshTable';

export default buildResponseView({
  useResponse: () => useSshKeyDataModel((s) => s.sshKeys),
  fallbackError: SshListState.Error,
  fallbackLoading: SshListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const [derivedViewMode] = useFilterModel((s) => [s.derivedViewMode]);
    const t = useDevetekTranslations();

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.sshKeys.emptyState.title')}
          message={t('page.sshKeys.emptyState.message')}
          ctaText={t('page.sshKeys.emptyState.cta')}
        />
      );
    }

    const tableData: SshTableData[] = list.flatMap((sshKey) => {
      const {
        id,
        name,
        type,
        updated_at,
        user,
        organization,
        workspace_type,
        workspace_id,
      } = sshKey;
      if (!id) return [];

      return [
        {
          id,
          name,
          type,
          lastUpdated: updated_at
            ? dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss')
            : null,
          ownerName: user?.fullname || user?.username || user?.email || null,
          teamName: organization?.name || null,
          teamId: workspace_type === 'group' ? workspace_id : null,
        },
      ];
    });

    if (derivedViewMode === 'table') {
      return <SshTable data={tableData} />;
    }

    return (
      <LayoutAutoGridList viewMode={derivedViewMode as 'grid' | 'list'}>
        {tableData.map((sshKey) => (
          <SshCard key={sshKey.id} data={sshKey} />
        ))}
      </LayoutAutoGridList>
    );
  },
});
