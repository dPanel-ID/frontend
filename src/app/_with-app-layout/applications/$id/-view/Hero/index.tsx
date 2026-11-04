import { Link } from '@tanstack/react-router';
import {
  AppWindowIcon,
  GithubIcon,
  PencilIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useDevetekTranslations } from '@/services/i18n';

import { iife } from '@/shared/libs/browser/fn';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { headlineState, headlineTone } from '../../-lib/describe-detail';
import { useHistoryLists } from '../../-lib/use-history-lists';
import { useAppDataModel } from '../../-model/app-data';
import { useEmit } from '../../-model/events';
import GithubAccountButton from '../../../-view/GithubAccountButton';

const FallbackLoading = () => (
  <div className="h-40 animate-pulse rounded-2xl border bg-card" />
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

/** The state of the whole application, in one word. */
const HeadlinePill = () => {
  const t = useDevetekTranslations();
  const { artifacts, deployments } = useHistoryLists();

  const state = headlineState({ lastBuild: artifacts[0], deployments });

  return (
    <StatusPill
      tone={headlineTone(state)}
      label={t(`page.applicationDetail.headline.${state}`)}
      pulse={state === 'building'}
    />
  );
};

const RefreshButton = () => {
  const emit = useEmit();
  const t = useDevetekTranslations();

  const handleRefresh = () => {
    emit('@applications::detail/app-detail-refresh', null);
    emit('@applications::detail/artifact-history-refresh', null);
    emit('@applications::detail/deployment-history-refresh', null);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      aria-label={t('common.actions.refresh')}
      title={t('common.actions.refresh')}
    >
      <RefreshCwIcon />
    </Button>
  );
};

export default guard(function Hero() {
  const t = useDevetekTranslations();

  const [appId, identity, deploymentTargets] = useAppDetail((s) => [
    s.id,
    s.identity,
    s.deploymentTargets,
  ]);
  const [gitDetail] = useAppDataModel((s) => [s.gitDetail]);

  useMetaTags({ title: `${identity.name} | dnocs` }, [identity.name]);

  const repoUrl = iife(() => {
    if (gitDetail.$status === 'success' && gitDetail.repo_url) {
      return gitDetail.repo_url;
    }

    if (identity.source !== 'repository') return undefined;

    return `https://github.com/${identity.repoOrganization}/${identity.repoName}`;
  });

  const description = iife(() => {
    const server = deploymentTargets[0]?.name;

    if (identity.source === 'repository') {
      const repo = `${identity.repoOrganization}/${identity.repoName}`;

      return server
        ? t('page.applicationDetail.hero.descriptionRepoOnServer', {
            repo,
            server,
          })
        : t('page.applicationDetail.hero.descriptionRepo', { repo });
    }

    return server
      ? t('page.applicationDetail.hero.descriptionBundleOnServer', { server })
      : t('page.applicationDetail.hero.descriptionBundle');
  });

  return (
    <FlowHero
      accent="sky"
      icon={AppWindowIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('page.applications.headerTitle'), url: '/applications' },
          ]}
        />
      }
      title={identity.name}
      description={description}
      aside={
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <HeadlinePill />

          {identity.source === 'repository' && <GithubAccountButton />}

          {repoUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={repoUrl} target="_blank" rel="noreferrer">
                <GithubIcon />
                <span className="hidden sm:inline">
                  {t('page.applicationDetail.hero.openRepository')}
                </span>
              </a>
            </Button>
          )}

          <RefreshButton />

          {identity.source === 'repository' && (
            <Link
              to="/applications/$id/update"
              params={{ id: appId }}
              className={flowCtaClassName('sky')}
            >
              <PencilIcon className="size-4" />
              {t('page.applicationDetail.hero.editSettings')}
            </Link>
          )}
        </div>
      }
    />
  );
});
