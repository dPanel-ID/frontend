import dayjs from 'dayjs';

import { useDevetekTranslations } from '@/services/i18n';

import LayoutAutoGridList from '@/shared/presentation/atoms/LayoutAutoGridList';
import { EmptyState } from '@/shared/presentation/organisms/EmptyState';
import { buildResponseView } from '@/widgets/response-view-builder';

import { CloudListState } from '../-presentation/CloudListState';
import { useCloudDataModel } from '../../-model/cloud-data';
import { useFilterModel } from '../../-model/filters';

import CloudCard from './CloudCard';
import CloudTable from './CloudTable';
import type { CloudTableData } from './CloudTable';

export default buildResponseView({
  useResponse: () => useCloudDataModel((s) => s.clouds),
  fallbackError: CloudListState.Error,
  fallbackLoading: CloudListState.Loading,
  render: function Render(props) {
    const { list } = props;

    const [derivedViewMode] = useFilterModel((s) => [s.derivedViewMode]);
    const t = useDevetekTranslations();

    if (list.length < 1) {
      return (
        <EmptyState
          title={t('page.cloudProjects.emptyState.title')}
          message={t('page.cloudProjects.emptyState.message')}
          ctaText={t('page.cloudProjects.emptyState.cta')}
        />
      );
    }

    const tableData: CloudTableData[] = list.flatMap((cloud) => {
      const {
        id,
        name,
        provider,
        updated_at,
        installer_status,
        user,
        organization,
        workspace,
        workspace_type,
        workspace_id,
      } = cloud;
      if (!id) return [];

      return [
        {
          id: String(id),
          name,
          provider,
          installerStatus: installer_status,
          lastUpdated: updated_at
            ? dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss')
            : null,
          ownerName: user?.fullname || user?.username || user?.email || null,
          teamName: workspace?.name || organization?.name || null,
          teamId: workspace_type === 'group' ? workspace_id : null,
        },
      ];
    });

    if (derivedViewMode === 'table') {
      return <CloudTable data={tableData} />;
    }

    return (
      <LayoutAutoGridList viewMode={derivedViewMode as 'grid' | 'list'}>
        {tableData.map((cloud) => (
          <CloudCard key={cloud.id} data={cloud} />
        ))}
      </LayoutAutoGridList>
    );
  },
});
