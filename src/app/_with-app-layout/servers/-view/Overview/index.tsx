import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { useFilterModel } from '../../-model/filters';
import type { ServerStatusFilter } from '../../-model/filters';
import { useServersOverviewModel } from '../../-model/overview';
import type { ServersOverview } from '../../-model/overview';

/**
 * Fleet-wide counts above the list. Each tile also narrows the list to its
 * state, so "3 need attention" is one click away from seeing which three.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const { status, setStatus, setPagination } = useFilterModel();
  const overviewState = useServersOverviewModel((s) => s);

  const overview = responseData<ServersOverview>(overviewState);
  const loading = !overview;

  const select = (next: ServerStatusFilter) => {
    setPagination(1);
    setStatus(status === next ? '' : next);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      <StatTile
        icon={ServerIcon}
        tone="sky"
        label={t('page.servers.overview.total')}
        value={overview?.total ?? 0}
        hint={
          overview
            ? t('page.servers.overview.totalHint', {
                cloud: overview.cloud,
                own: overview.own,
              })
            : undefined
        }
        loading={loading}
        active={status === ''}
        onClick={() => select('')}
      />
      <StatTile
        icon={CircleCheckIcon}
        tone="emerald"
        label={t('page.servers.overview.ready')}
        value={overview?.ready ?? 0}
        loading={loading}
        active={status === 'ready'}
        onClick={() => select('ready')}
      />
      <StatTile
        icon={LoaderIcon}
        tone="sky"
        label={t('page.servers.overview.progress')}
        value={overview?.progress ?? 0}
        loading={loading}
        active={status === 'progress'}
        onClick={() => select('progress')}
      />
      <StatTile
        icon={CircleAlertIcon}
        tone={overview?.failed ? 'red' : 'neutral'}
        label={t('page.servers.overview.failed')}
        value={overview?.failed ?? 0}
        loading={loading}
        active={status === 'failed'}
        onClick={() => select('failed')}
      />
    </div>
  );
}

function responseData<T>(
  response: { $status: string; prevData?: T } & Partial<T>,
) {
  if (response.$status === 'success') return response as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}
