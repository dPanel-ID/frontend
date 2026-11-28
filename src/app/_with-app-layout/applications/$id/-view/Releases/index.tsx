import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { usesReleaseFolders } from '@/entities/application/lib/release-folders';

import { iife } from '@/shared/libs/browser/fn';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Pagination } from '@/shared/presentation/atoms/Pagination';

import { useAppDataModel } from '../../-model/app-data';
import { useArtifactHistoryModel } from '../../-model/artifact-history';
import { useEmit } from '../../-model/events';
import { useDeployNewBuild } from '../../-usecase/deploy-new-build';

import { DeploymentList } from './_DeploymentList';
import { ArtifactsHistoryList as BuildList } from './_List';
import { ReleasesSection } from './_presentation';
import type { ReleasesTab } from './_presentation/ReleasesSection';
import { ReleasesStates as UIStates } from './_States';

const FallbackLoading = () => (
  <div className="h-64 animate-pulse rounded-2xl border bg-card" />
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

export default guard(function Releases() {
  const t = useDevetekTranslations();
  const emit = useEmit();

  const [appSource] = useAppDetail((s) => [s.identity.source]);
  const [rawAppDefinition] = useAppDataModel((s) => [s.rawAppDefinition]);
  const deploy = useDeployNewBuild();

  const [tab, setTab] = useState<ReleasesTab>('builds');

  const [
    artifactHistory,
    deploymentHistory,
    lastDeployment,
    artifactPage,
    setArtifactPage,
  ] = useArtifactHistoryModel((s) => [
    s.artifactHistory,
    s.deploymentHistory,
    s.lastDeployment,
    s.artifactPage,
    s.setArtifactPage,
  ]);

  const isRepository = appSource === 'repository';

  const builds = settled(artifactHistory);
  const deployments = settled(deploymentHistory);

  const body = iife(() => {
    if (!isRepository) return <UIStates.NotEligible />;

    if (tab === 'builds') {
      if (artifactHistory.$status === 'failed') {
        return (
          <UIStates.Failed
            error={artifactHistory.error}
            onClickRetry={() =>
              emit('@applications::detail/artifact-history-refresh', null)
            }
          />
        );
      }

      if (!builds) return <UIStates.Loading />;
      if (builds.list.length === 0) {
        return <UIStates.EmptyBuilds onClickNew={deploy.open} />;
      }

      return (
        <BuildList
          list={builds.list}
          deploymentList={deployments?.list ?? []}
          lastDeployment={lastDeployment}
        />
      );
    }

    if (deploymentHistory.$status === 'failed') {
      return (
        <UIStates.Failed
          error={deploymentHistory.error}
          onClickRetry={() =>
            emit('@applications::detail/deployment-history-refresh', null)
          }
        />
      );
    }

    if (!deployments) return <UIStates.Loading />;
    if (deployments.list.length === 0) return <UIStates.EmptyServers />;

    return (
      <DeploymentList
        list={deployments.list}
        artifactList={builds?.list ?? []}
        usesReleaseFolders={usesReleaseFolders(rawAppDefinition)}
      />
    );
  });

  const pagination = tab === 'builds' ? builds?.pagination : undefined;

  return (
    <ReleasesSection
      activeTab={tab}
      onSelectTab={setTab}
      ctaNewVisible={isRepository}
      ctaNewState={deploy.state}
      ctaNewOnClick={deploy.open}
      withStorageNote={isRepository && tab === 'builds'}
      footer={
        pagination && pagination.total_page > 1 ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {t('page.applicationDetail.releases.pageOf', {
                page: pagination.page,
                total: pagination.total_page,
              })}
            </p>
            <Pagination
              currentPage={artifactPage}
              maxPage={pagination.total_page}
              onPageChange={setArtifactPage}
            />
          </div>
        ) : undefined
      }
    >
      {body}
    </ReleasesSection>
  );
});

function settled<T>(response: {
  $status: string;
  list?: T[];
  pagination?: { page: number; total_page: number; total_item: number };
  prevData?: {
    list: T[];
    pagination: { page: number; total_page: number; total_item: number };
  };
}) {
  if (response.$status === 'success') {
    return { list: response.list ?? [], pagination: response.pagination! };
  }

  if (response.$status === 'loading' && response.prevData) {
    return response.prevData;
  }

  return undefined;
}
