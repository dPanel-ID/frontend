// @vitest-environment jsdom

import {
  cleanup,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SectionSourceGithub from './SectionSourceGithub';

const store = vi.hoisted(
  (): { githubRepos: Record<string, unknown> } => ({
    githubRepos: { $status: 'loading' },
  }),
);

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
}));

vi.mock('@/services/auth', () => ({
  useAuthLoggedIn: () => ({ gitProfile: { id: 1, login: 'octo' } }),
}));

vi.mock('@/shared/api', () => ({
  ApiGitRepository: {
    Detail: {
      $RepoOrg: { $RepoName: { useGet: () => [{ $status: 'idle' }] } },
    },
  },
}));

vi.mock('../../../../../-view/GithubSessionBanner', () => ({
  default: () => <p>github session banner</p>,
}));

vi.mock('../../../../-model/store/form', () => ({
  useFormStore: () => [vi.fn(), vi.fn(), vi.fn(), undefined],
}));

vi.mock('../../../../-model/store/github-repos', () => ({
  ADD_GITHUB_ACCOUNT_VALUE: 'add',
  useGithubReposStore: () => ({
    githubRepos: store.githubRepos,
    page: 1,
    setPage: vi.fn(),
    query: '',
    setQuery: vi.fn(),
    githubOrg: undefined,
    setGithubOrg: vi.fn(),
    refresh: vi.fn(),
  }),
}));

afterEach(cleanup);

describe('SectionSourceGithub', () => {
  // A lapsed GitHub session answered 401 and the step spun forever.
  it('offers to reconnect GitHub when the repository list answers 401', () => {
    store.githubRepos = {
      $status: 'failed',
      kind: 'api',
      error: { code: 401, status: 401, message: 'github session expired' },
    };
    render(<SectionSourceGithub />);

    expect(screen.getByText('github session banner')).toBeTruthy();
  });

  it('shows a retryable error when the list fails otherwise', () => {
    store.githubRepos = {
      $status: 'failed',
      kind: 'api',
      error: { code: 502, status: 502, message: 'github is unavailable' },
    };
    render(<SectionSourceGithub />);

    expect(screen.getByRole('alert').textContent).toContain('loadFailedTitle');
    expect(screen.getByText('retry')).toBeTruthy();
    expect(screen.queryByText('github session banner')).toBeNull();
  });
});
