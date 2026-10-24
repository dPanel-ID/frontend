import { HammerIcon, LayersIcon, PlugZapIcon, ServerIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import type { StatTileTone } from '@/shared/presentation/molecules/StatTile';

import { liveServerCount } from '../../-lib/describe-detail';
import { useHistoryLists } from '../../-lib/use-history-lists';
import { useAppDataModel } from '../../-model/app-data';
import { useArtifactHistoryModel } from '../../-model/artifact-history';

const FallbackLoading = () => (
  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
    {[0, 1, 2, 3].map((key) => (
      <div key={key} className="h-20 animate-pulse rounded-xl border bg-card" />
    ))}
  </div>
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

const BUILD_TONES: Record<string, StatTileTone> = {
  ready: 'emerald',
  progress: 'sky',
  failed: 'red',
  cancelled: 'amber',
};

/**
 * The four numbers someone wants before anything else: is it serving, did
 * the last build pass, how much history is kept, and which port it answers
 * on. None of them filters anything, so none of them is a button.
 */
export default guard(function Overview() {
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const [deploymentTargets, lifecycle] = useAppDetail((s) => [
    s.deploymentTargets,
    s.configDefs.lifecycle,
  ]);

  const { artifacts, deployments, loading } = useHistoryLists();
  const [artifactHistory] = useArtifactHistoryModel((s) => [s.artifactHistory]);

  const live = liveServerCount(deployments);
  const lastBuild = artifacts[0];

  const buildsKept =
    artifactHistory.$status === 'success'
      ? artifactHistory.pagination.total_item
      : artifactHistory.$status === 'loading' && artifactHistory.prevData
        ? artifactHistory.prevData.pagination.total_item
        : undefined;

  const run = lifecycle?.run;

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      <StatTile
        icon={ServerIcon}
        tone={live > 0 ? 'emerald' : 'neutral'}
        label={t('page.applicationDetail.overview.liveServers')}
        value={live}
        hint={t('page.applicationDetail.overview.liveServersHint', {
          total: deploymentTargets.length,
        })}
        loading={loading}
      />

      <StatTile
        icon={HammerIcon}
        tone={
          lastBuild
            ? (BUILD_TONES[lastBuild.state.status] ?? 'neutral')
            : 'neutral'
        }
        label={t('page.applicationDetail.overview.lastBuild')}
        value={
          lastBuild
            ? t(`page.applicationDetail.buildStatus.${lastBuild.state.status}`)
            : t('page.applicationDetail.overview.never')
        }
        hint={
          lastBuild
            ? getDistanceFromNow(lastBuild.timestamp.updated, locale)
            : t('page.applicationDetail.overview.neverHint')
        }
        loading={loading}
      />

      <StatTile
        icon={LayersIcon}
        tone="sky"
        label={t('page.applicationDetail.overview.buildsKept')}
        value={buildsKept ?? 0}
        hint={t('page.applicationDetail.overview.buildsKeptHint')}
        loading={loading}
      />

      <StatTile
        icon={PlugZapIcon}
        tone={run?.port ? 'sky' : 'neutral'}
        label={t('page.applicationDetail.overview.port')}
        value={run?.port ?? '—'}
        hint={run?.name ?? t('page.applicationDetail.overview.portUnknownHint')}
      />
    </div>
  );
});
