import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderIcon,
  NetworkIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import { useEmit } from '../../-models/events';
import { useFilterModel } from '../../-models/filters';
import {
  OVERVIEW_SAMPLE_SIZE,
  useLbOverviewModel,
} from '../../-models/overview';
import type { LoadBalancersOverview } from '../../-models/overview';
import type { FilterRules } from '../../-rules';

/**
 * Counts across the workspace above the list. The backend accepts
 * `installer_status` as a router filter, so each tile really does narrow the
 * list to its state rather than only reporting it.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const emit = useEmit();
  const { overview: response } = useLbOverviewModel();
  const [status] = useFilterModel((s) => [s.status]);

  const overview = responseData<LoadBalancersOverview>(response);
  const loading = !overview;

  const select = (next: FilterRules.Status) => {
    emit('@load-balancers/filters/pagination--set', 1);
    emit('@load-balancers/filters/status--change', status === next ? '' : next);
  };

  const totalHint = overview
    ? overview.gateways === 1
      ? t('page.loadBalancers.overview.totalHintOne')
      : t('page.loadBalancers.overview.totalHint', {
          gateways: overview.gateways,
        })
    : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatTile
          icon={NetworkIcon}
          tone="sky"
          label={t('page.loadBalancers.overview.total')}
          value={overview?.total ?? 0}
          hint={overview?.gateways ? totalHint : undefined}
          loading={loading}
          active={status === ''}
          onClick={() => select('')}
        />
        <StatTile
          icon={CircleCheckIcon}
          tone="emerald"
          label={t('page.loadBalancers.overview.ready')}
          value={overview?.ready ?? 0}
          loading={loading}
          active={status === 'ready'}
          onClick={() => select('ready')}
        />
        <StatTile
          icon={LoaderIcon}
          tone="sky"
          label={t('page.loadBalancers.overview.progress')}
          value={overview?.progress ?? 0}
          loading={loading}
          active={status === 'progress'}
          onClick={() => select('progress')}
        />
        <StatTile
          icon={CircleAlertIcon}
          tone={overview?.failed ? 'red' : 'neutral'}
          label={t('page.loadBalancers.overview.failed')}
          value={overview?.failed ?? 0}
          loading={loading}
          active={status === 'failed'}
          onClick={() => select('failed')}
        />
      </div>

      {overview?.sampled && (
        <p className="text-[0.7rem] text-muted-foreground">
          {t('page.loadBalancers.overview.sampleNote', {
            sample: OVERVIEW_SAMPLE_SIZE,
          })}
        </p>
      )}
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
