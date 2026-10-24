import { useMemo, useState } from 'react';

import { useAuthLoggedIn } from '@/services/auth';

import { ApiGitRepository } from '@/shared/api';
import { excludeNully } from '@/shared/libs/browser/typeguards';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

export const ADD_GITHUB_ACCOUNT_VALUE = 'https://github.com/apps/dnocs-id';

export const [GithubReposStoreProvider, useGithubReposStore] = buildContext(
  'ApplicationsCreateGithubReposStore',
  () => {
    // gitProfile is null unless GitHub is linked, which is all this store
    // needs to know; the token lives on the server.
    const { gitProfile } = useAuthLoggedIn();

    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [githubOrg, setGithubOrg] = useState<string>();

    const handleOnsetGithubOrg = (value: string) => {
      if (value === ADD_GITHUB_ACCOUNT_VALUE) {
        window.open(
          `${import.meta.env.VITE_GITHUB_APP_URL}/installations/new`,
          '_blank',
        );

        return;
      }

      setGithubOrg(value);
    };

    const [responseGitRepositories, refresh] = ApiGitRepository.Find.useGet({
      page,
      pageSize: 5,
      gitOrganization: githubOrg,
      query,
      options: {
        skip: !gitProfile,
      },
    });

    const githubRepos = useMemo(() => {
      if (!gitProfile)
        return {
          $status: 'logged-out' as const,
        };

      if (responseGitRepositories.$status !== 'success')
        return responseGitRepositories;

      const { repos, next_page } = responseGitRepositories;

      return {
        $status: 'success' as const,
        nextPage: next_page || null,
        list: (repos ?? [])
          .map((repository) => {
            const {
              default_branch,
              repo_description,
              repo_framework,
              repo_language,
              repo_name,
              repo_org,
              repo_url,
              commit_id,
              commit_message,
            } = repository;

            if (!repo_name || !repo_url || !repo_org) return null;

            return {
              repoName: repo_name,
              repoUrl: repo_url,
              repoOrg: repo_org,
              description: repo_description,
              defaultBranch: default_branch,
              framework: repo_framework,
              language: repo_language,
              commitId: commit_id,
              commitMessage: commit_message,
            };
          })
          .filter(excludeNully),
      };
    }, [gitProfile, responseGitRepositories]);

    return {
      githubRepos,
      page,
      setPage,
      query,
      setQuery,
      githubOrg,
      setGithubOrg: handleOnsetGithubOrg,
      refresh,
    };
  },
);
