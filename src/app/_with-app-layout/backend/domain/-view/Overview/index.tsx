import { BuildingIcon, CloudIcon, GlobeIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import {
  OVERVIEW_SAMPLE_SIZE,
  useDomainOverviewModel,
} from '../../-models/overview';
import type { DomainsOverview } from '../../-models/overview';

/**
 * Workspace-wide counts above the list. The find endpoint filters by
 * provider but not by ownership, and these tiles describe ownership, so they
 * report rather than filter; a tile that cannot narrow the list is not a
 * button.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const { overview: response } = useDomainOverviewModel();

  const overview = responseData<DomainsOverview>(response);
  const loading = !overview;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatTile
          icon={GlobeIcon}
          tone="sky"
          label={t('page.domain.overview.total')}
          value={overview?.total ?? 0}
          loading={loading}
        />
        <StatTile
          icon={CloudIcon}
          tone="emerald"
          label={t('page.domain.overview.providers')}
          value={overview?.providers ?? 0}
          hint={t('page.domain.overview.providersHint')}
          loading={loading}
        />
        <StatTile
          icon={BuildingIcon}
          tone={overview?.team ? 'amber' : 'neutral'}
          label={t('page.domain.overview.team')}
          value={overview?.team ?? 0}
          hint={t('page.domain.overview.teamHint')}
          loading={loading}
        />
        <StatTile
          icon={UserIcon}
          tone="neutral"
          label={t('page.domain.overview.personal')}
          value={overview?.personal ?? 0}
          hint={t('page.domain.overview.personalHint')}
          loading={loading}
        />
      </div>

      {overview?.sampled && (
        <p className="text-[0.7rem] text-muted-foreground">
          {t('page.domain.overview.sampleNote', {
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
