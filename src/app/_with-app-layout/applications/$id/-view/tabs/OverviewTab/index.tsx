import { Link, useParams } from '@tanstack/react-router';
import {
  CalendarIcon,
  FolderIcon,
  GitBranchIcon,
  GithubIcon,
  GlobeIcon,
  HammerIcon,
  LayersIcon,
  PlugZapIcon,
  ServerIcon,
  SquareTerminalIcon,
  UserIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import type { StatTileTone } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  isMovingStatus,
  liveServerCount,
  releaseStatusOfArtifact,
  releaseTone,
  serversOf,
} from '../../../-lib/describe-detail';
import type { ReleaseStatus } from '../../../-lib/describe-detail';
import { useHistoryLists } from '../../../-lib/use-history-lists';
import { useAppDataModel } from '../../../-model/app-data';
import { useArtifactHistoryModel } from '../../../-model/artifact-history';
import { useDeployNewBuild } from '../../../-usecase/deploy-new-build';
import { usePublicEndpoint } from '../../../-usecase/public-url';

import CurrentDeployment from './_CurrentDeployment';
import { Row, Section } from './_Partials';

const FallbackLoading = () => (
  <div className="flex flex-col gap-4">
    <div className="h-56 animate-pulse rounded-2xl border bg-card" />
    <div className="h-20 animate-pulse rounded-2xl border bg-card" />
  </div>
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

const RELEASE_TONES: Record<ReleaseStatus, StatTileTone> = {
  deployed: 'emerald',
  pending: 'sky',
  progress: 'sky',
  removing: 'sky',
  failed: 'red',
  cancelled: 'amber',
  inactive: 'neutral',
};

/**
 * What a developer wants on opening the page: what is live, the numbers,
 * how it is wired up, and the last few builds. Everything else is a tab.
 */
export default guard(function OverviewTab() {
  const t = useDevetekTranslations('page.applicationDetail.overview');
  const tRelease = useDevetekTranslations(
    'page.applicationDetail.releaseStatus',
  );
  const locale = useDevetekLocale();
  const { id } = useParams({ from: '/_with-app-layout/applications/$id/' });

  const [identity, configDefs, deploymentTargets, ownership, timestamp] =
    useAppDetail((s) => [
      s.identity,
      s.configDefs,
      s.deploymentTargets,
      s.ownership,
      s.timestamp,
    ]);
  const [rawWorkdir] = useAppDataModel((s) => [s.rawWorkdir]);

  const { artifacts, deployments, loading } = useHistoryLists();
  const [artifactHistory, lastDeployment] = useArtifactHistoryModel((s) => [
    s.artifactHistory,
    s.lastDeployment,
  ]);

  const deploy = useDeployNewBuild();
  const endpoint = usePublicEndpoint();

  const run = configDefs.lifecycle?.run;
  const live = liveServerCount(deployments);
  const lastBuild = artifacts[0];
  const lastBuildStatus =
    lastBuild &&
    releaseStatusOfArtifact({ artifact: lastBuild, lastDeployment });
  const servers = serversOf(deployments, deploymentTargets);
  const server = servers[0];

  const current = lastDeployment ?? deployments[0];
  const currentArtifact = current
    ? artifacts.find((one) => one.id === current.pointerIds.artifact)
    : undefined;

  const buildsKept =
    artifactHistory.$status === 'success'
      ? artifactHistory.pagination.total_item
      : artifactHistory.$status === 'loading' && artifactHistory.prevData
        ? artifactHistory.prevData.pagination.total_item
        : undefined;

  const repoLabel =
    identity.source === 'repository'
      ? `${identity.repoOrganization}/${identity.repoName}`
      : undefined;
  const repoUrl =
    identity.source === 'repository'
      ? `https://github.com/${identity.repoOrganization}/${identity.repoName}`
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <CurrentDeployment
        deployment={current}
        artifact={currentArtifact}
        href={endpoint?.href}
        domain={endpoint?.domain}
        canDeploy={identity.source === 'repository' && deploy.state == null}
        onDeploy={deploy.open}
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatTile
          icon={ServerIcon}
          tone={live > 0 ? 'emerald' : 'neutral'}
          label={t('liveServers')}
          value={live}
          hint={t('liveServersHint', { total: servers.length })}
          loading={loading}
        />
        <StatTile
          icon={HammerIcon}
          tone={lastBuildStatus ? RELEASE_TONES[lastBuildStatus] : 'neutral'}
          label={t('lastBuild')}
          value={lastBuildStatus ? tRelease(lastBuildStatus) : t('never')}
          hint={
            lastBuild
              ? getDistanceFromNow(lastBuild.timestamp.updated, locale)
              : t('neverHint')
          }
          loading={loading}
        />
        <StatTile
          icon={LayersIcon}
          tone="sky"
          label={t('buildsKept')}
          value={buildsKept ?? 0}
          hint={t('buildsKeptHint')}
          loading={loading}
        />
        <StatTile
          icon={PlugZapIcon}
          tone={run?.port ? 'sky' : 'neutral'}
          label={t('port')}
          value={run?.port ?? '—'}
          hint={run?.name ?? t('portUnknownHint')}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={ServerIcon} title={t('details')}>
          <dl className="divide-y">
            {repoLabel && (
              <Row
                icon={GithubIcon}
                label={t('repository')}
                value={
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {repoLabel}
                  </a>
                }
              />
            )}
            {currentArtifact && (
              <Row
                icon={GitBranchIcon}
                label={t('branch')}
                value={currentArtifact.commitMetadata.fromBranch}
              />
            )}
            {endpoint?.domain && (
              <Row
                icon={GlobeIcon}
                label={t('address')}
                value={
                  <a
                    href={endpoint.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {endpoint.domain}
                  </a>
                }
              />
            )}
            <Row
              icon={ServerIcon}
              label={t('server')}
              value={
                server ? (
                  <Link
                    to="/servers/$id"
                    params={{ id: server.id }}
                    className="underline-offset-2 hover:underline"
                  >
                    {server.name}
                  </Link>
                ) : undefined
              }
            />
            <Row
              icon={SquareTerminalIcon}
              label={t('service')}
              value={run?.name}
              mono
            />
            <Row
              icon={FolderIcon}
              label={t('workdir')}
              value={rawWorkdir || undefined}
              mono
            />
            <Row
              icon={UserIcon}
              label={t('ownership')}
              value={<OwnerLink ownership={ownership} preferTeam />}
            />
            <Row
              icon={CalendarIcon}
              label={t('created')}
              value={timestamp.created.toLocaleDateString(locale, {
                dateStyle: 'medium',
              })}
            />
          </dl>
        </Section>

        <Section
          icon={HammerIcon}
          title={t('recentBuilds')}
          description={t('recentBuildsHint')}
          action={
            <Link
              to="/applications/$id"
              params={{ id }}
              search={{ tab: 'deployments' }}
              className="shrink-0 text-sm font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-sky-300"
            >
              {t('viewAll')}
            </Link>
          }
        >
          {artifacts.length === 0 ? (
            <p className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
              {t('noBuilds')}
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {artifacts.slice(0, 5).map((artifact) => {
                const status = releaseStatusOfArtifact({
                  artifact,
                  lastDeployment,
                });

                return (
                  <li
                    key={artifact.id}
                    className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <StatusPill
                      size="sm"
                      tone={releaseTone(status)}
                      label={tRelease(status)}
                      pulse={isMovingStatus(status)}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {artifact.commitMetadata.title}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {artifact.commitMetadata.fromBranch} ·{' '}
                        {artifact.commitMetadata.head.slice(0, 7)}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {getDistanceFromNow(artifact.timestamp.updated, locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
});
