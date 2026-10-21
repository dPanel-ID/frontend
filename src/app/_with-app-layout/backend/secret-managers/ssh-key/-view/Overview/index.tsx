import { BuildingIcon, KeyRoundIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StatTile } from '@/shared/presentation/molecules/StatTile';

import {
  OVERVIEW_SAMPLE_SIZE,
  useSshKeysOverviewModel,
} from '../../-model/overview';
import type { SshKeysOverview } from '../../-model/overview';

/**
 * Workspace-wide counts above the list: how many keys exist and who can use
 * them. The API has no ownership filter, so the tiles report rather than
 * filter; a tile that cannot narrow the list is not a button.
 */
export default function Overview() {
  const t = useDevetekTranslations();
  const { overview: response } = useSshKeysOverviewModel();

  const overview = responseData<SshKeysOverview>(response);
  const loading = !overview;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <StatTile
          icon={KeyRoundIcon}
          tone="sky"
          label={t('page.sshKeys.overview.total')}
          value={overview?.total ?? 0}
          hint={
            overview
              ? t('page.sshKeys.overview.totalHint', {
                  personal: overview.personal,
                  team: overview.team,
                })
              : undefined
          }
          loading={loading}
        />
        <StatTile
          icon={UserIcon}
          tone="emerald"
          label={t('page.sshKeys.overview.personal')}
          value={overview?.personal ?? 0}
          hint={t('page.sshKeys.overview.personalHint')}
          loading={loading}
        />
        <StatTile
          icon={BuildingIcon}
          tone={overview?.team ? 'amber' : 'neutral'}
          label={t('page.sshKeys.overview.team')}
          value={overview?.team ?? 0}
          hint={t('page.sshKeys.overview.teamHint')}
          loading={loading}
          className="max-lg:col-span-2"
        />
      </div>

      {overview?.sampled && (
        <p className="text-[0.7rem] text-muted-foreground">
          {t('page.sshKeys.overview.sampleNote', {
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
