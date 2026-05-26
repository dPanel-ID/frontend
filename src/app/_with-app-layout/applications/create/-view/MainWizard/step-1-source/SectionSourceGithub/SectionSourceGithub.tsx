import { useEffect, useState } from 'react';

import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  GitBranchIcon,
  GithubIcon,
  SearchXIcon,
} from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { ApiGitRepository } from '@/shared/api';
import {
  buildFrontendReturnUrl,
  buildGithubAuthUrl,
} from '@/shared/libs/browser/oauth';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card, CardContent } from '@/shared/presentation/atoms/Card';
import { SearchInput } from '@/shared/presentation/atoms/SearchInput';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { useFormStore } from '../../../../-model/store/form';
import {
  ADD_GITHUB_ACCOUNT_VALUE,
  useGithubReposStore,
} from '../../../../-model/store/github-repos';
import GithubLoginWall from '../_presentation/GithubLoginWall/GithubLoginWall';

type RepoItem = {
  repoName: string;
  repoUrl: string;
  repoOrg: string;
  description?: string;
  defaultBranch?: string;
  framework?: string;
  language?: string;
};

type RepoChip = {
  icon: typeof GitBranchIcon;
  label: string;
};

function isRepoChip(chip: RepoChip | null): chip is RepoChip {
  return chip != null;
}

export default function SectionSourceGithub() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step1.sectionGithubRepo',
  );

  const { gitProfile } = useAuthLoggedIn();

  const [
    setAppSourceGithubRepo,
    setAppSourceBundleIdent,
    setGitRepoConfig,
  ] = useFormStore((s) => [
    s.setAppSourceGithubRepo,
    s.setAppSourceBundleIdent,
    s.setGitRepoConfig,
  ]);

  const { githubRepos, page, setPage, query, setQuery, githubOrg, setGithubOrg } =
    useGithubReposStore();

  const [githubRepoUrl, setGithubRepoUrl] = useState<string>();
  const [repoOrganization = '', repoName = ''] =
    githubRepoUrl
      ?.replace('https://github.com/', '')
      .replace('.git', '')
      .split('/') || [];
  const [repositoryDetail] = ApiGitRepository.Detail.$RepoOrg.$RepoName.useGet({
    repoName,
    repoOrganization,
    options: {
      skip: !githubRepoUrl || !repoOrganization || !repoName,
    },
  });

  const { githubAccessToken: gitToken = '', login: gitNickname = '' } =
    gitProfile || {};

  useEffect(() => {
    if (repositoryDetail.$status !== 'success' || !githubRepoUrl) return;

    const {
      repo_framework: repoFramework = 'unknown',
      default_branch: defaultBranch = '',
      commit_id: commitID = '',
      commit_message: commitMessage = '',
    } = repositoryDetail;

    setAppSourceGithubRepo(githubRepoUrl);
    setAppSourceBundleIdent(repoFramework);
    setGitRepoConfig({
      gitProvider: 'github',
      gitHost: 'github.com',
      gitRepository: githubRepoUrl,
      gitDefaultBranch: defaultBranch,
      gitNickname,
      gitToken,
      gitBranch: defaultBranch,
      gitHead: commitID,
      gitHeadDescription: commitMessage,
    });
  }, [
    gitNickname,
    gitToken,
    githubRepoUrl,
    repositoryDetail,
    setAppSourceBundleIdent,
    setAppSourceGithubRepo,
    setGitRepoConfig,
  ]);

  const handleClickLoginGithub = () => {
    localStorage.setItem('auth:provider', 'github');
    window.location.href = buildGithubAuthUrl(
      buildFrontendReturnUrl('/applications/create', '?source=github'),
    );
  };

  let elContent =
    githubRepos.$status === 'logged-out' || !gitProfile ? (
      <GithubLoginWall onClick={handleClickLoginGithub} />
    ) : (
      <Spinner />
    );

  if (githubRepos.$status === 'success') {
    const gitOrgs = [
      { id: gitProfile?.id || 0, login: gitProfile?.login || '' },
      ...(gitProfile?.organizations || []),
      { id: -1, login: ADD_GITHUB_ACCOUNT_VALUE },
    ];

    elContent = (
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Combobox<string>
            classNameButton="w-full sm:w-64"
            onChange={setGithubOrg}
            placeholder={t('orgPlaceholder')}
            value={githubOrg}
            items={gitOrgs.map((org) => {
              const { login } = org;

              return {
                value: login,
                label:
                  login === ADD_GITHUB_ACCOUNT_VALUE
                    ? t('addGithubAccount')
                    : login,
              };
            })}
          />
          <SearchInput
            classNameWrapper="w-full sm:w-72"
            placeholder={t('searchPlaceholder')}
            defaultValue={query}
            onEnter={(nextQuery) => {
              setQuery(nextQuery);
              setPage(1);
            }}
          />
        </div>

        {githubRepos.list.length > 0 ? (
          <RepositoryPicker
            repositories={githubRepos.list}
            selectedUrl={githubRepoUrl}
            onSelect={(repo) => {
              const repoFramework = repo.framework || repo.language || 'unknown';
              const defaultBranch = repo.defaultBranch ?? '';

              setGithubRepoUrl(repo.repoUrl);
              setAppSourceGithubRepo(repo.repoUrl);
              setAppSourceBundleIdent(repoFramework);
              setGitRepoConfig({
                gitProvider: 'github',
                gitHost: 'github.com',
                gitRepository: repo.repoUrl,
                gitDefaultBranch: defaultBranch,
                gitNickname,
                gitToken,
                gitBranch: defaultBranch,
                gitHead: '',
                gitHeadDescription: '',
              });
            }}
          />
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border bg-background px-4 py-8 text-center">
            <SearchXIcon className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">{t('emptyTitle')}</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              {t('emptyDesc')}
            </p>
          </div>
        )}

        {githubRepoUrl && repositoryDetail.$status === 'loading' && (
          <div className="flex items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
            <Spinner className="size-3.5" />
            {t('loadingRepoDetails')}
          </div>
        )}

        {githubRepoUrl && repositoryDetail.$status === 'success' && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 text-xs text-primary">
            <CheckCircle2Icon className="size-4 text-emerald-500" />
            <span className="font-semibold">{t('selectedRepo')}</span>
            <span className="min-w-0 truncate text-muted-foreground">
              {repoOrganization}/{repoName}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            {t('previous')}
          </Button>
          <span className="text-xs text-muted-foreground">
            {t('page', { page })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!githubRepos.nextPage}
            onClick={() => setPage(page + 1)}
          >
            {t('next')}
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </>
    );
  }

  return (
    <Card className="rounded-2xl shadow-none">
      <CardContent className="flex flex-col gap-4 p-3 sm:p-5">
        {elContent}
      </CardContent>
    </Card>
  );
}

function RepositoryPicker(props: {
  repositories: RepoItem[];
  selectedUrl?: string;
  onSelect: (repo: RepoItem) => void;
}) {
  const { onSelect, repositories, selectedUrl } = props;
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step1.sectionGithubRepo',
  );

  return (
    <div
      className="grid max-h-[28rem] gap-2 overflow-y-auto rounded-lg border bg-background p-2"
      role="radiogroup"
      aria-label={t('title')}
    >
      {repositories.map((repo) => {
        const selected = selectedUrl === repo.repoUrl;
        const description = repo.description || t('noDescription');
        const chips = [
          repo.defaultBranch
            ? {
                icon: GitBranchIcon,
                label: t('defaultBranch', { branch: repo.defaultBranch }),
              }
            : null,
          repo.language
            ? {
                icon: Code2Icon,
                label: repo.language,
              }
            : null,
          repo.framework
            ? {
                icon: Code2Icon,
                label: t('framework', { framework: repo.framework }),
              }
            : null,
        ].filter(isRepoChip);

        return (
          <button
            key={repo.repoUrl}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(repo)}
            className={cn(
              'group grid gap-3 rounded-lg border bg-card p-3 text-left transition-all',
              'hover:border-primary/50 hover:bg-primary/5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
              selected && 'border-primary bg-primary/10',
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground',
                  selected && 'border-primary/50 text-primary',
                )}
              >
                <GithubIcon className="size-5" />
              </span>

              <span className="grid min-w-0 flex-1 gap-1">
                <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="truncate text-sm font-semibold text-muted-foreground">
                    {repo.repoOrg}
                  </span>
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="truncate text-base font-bold text-primary">
                    {repo.repoName}
                  </span>
                </span>
                <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </span>

              <span
                className={cn(
                  'mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-transparent',
                  selected && 'border-primary bg-primary text-primary-foreground',
                )}
              >
                <CheckCircle2Icon className="size-4" />
              </span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 pl-0 sm:pl-[3.25rem]">
              <span className="max-w-full truncate rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                {repo.repoUrl}
              </span>

              {chips.map((chip) => {
                const ChipIcon = chip.icon;

                return (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <ChipIcon className="size-3" />
                    {chip.label}
                  </span>
                );
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
