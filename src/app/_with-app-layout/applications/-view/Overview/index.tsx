import {
  AppWindowIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import {
  OVERVIEW_SAMPLE_SIZE,
  useAppsOverviewModel,
} from '../../-model/overview';
import type { ApplicationsOverview } from '../../-model/overview';

/**
 * Workspace-wide counts above the list. The find endpoint has no status
 * filter, so these report rather than filter; a tile that cannot narrow the
 * list is not a button.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const { overview: response } = useAppsOverviewModel();

  const overview = responseData<ApplicationsOverview>(response);
  const loading = !overview;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatTile
          icon={AppWindowIcon}
          tone="sky"
          label={t('page.applications.overview.total')}
          value={overview?.total ?? 0}
          loading={loading}
        />
        <StatTile
          icon={CircleCheckIcon}
          tone="emerald"
          label={t('page.applications.overview.running')}
          value={overview?.running ?? 0}
          loading={loading}
        />
        <StatTile
          icon={LoaderIcon}
          tone="sky"
          label={t('page.applications.overview.building')}
          value={overview?.building ?? 0}
          loading={loading}
        />
        <StatTile
          icon={CircleAlertIcon}
          tone={overview?.attention ? 'red' : 'neutral'}
          label={t('page.applications.overview.attention')}
          value={overview?.attention ?? 0}
          loading={loading}
        />
      </div>

      {overview?.sampled && (
        <p className="text-[0.7rem] text-muted-foreground">
          {t('page.applications.overview.sampleNote', {
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
