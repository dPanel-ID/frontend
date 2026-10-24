import { useAuthLoggedIn } from '@/services/auth';
import { useAuthModel } from '@/services/auth/model';

import {
  buildFrontendReturnUrl,
  buildGithubAuthUrl,
} from '@/shared/libs/browser/oauth';

export type GithubConnectionState =
  /** A token is stored and GitHub answered with the account behind it. */
  | 'connected'
  /** A token is stored but GitHub would not confirm it. */
  | 'unverified'
  /** No GitHub token on the account at all. */
  | 'disconnected'
  /** Still asking GitHub who this is. */
  | 'checking';

export interface GithubConnection {
  state: GithubConnectionState;
  /** The GitHub handle, once GitHub has confirmed it. */
  login?: string;
  /** Sends the browser to GitHub and comes back to the current page. */
  connect: () => void;
}

/**
 * Whether this workspace can read GitHub right now.
 *
 * `gitProfile` is non-null as soon as the account carries any stored token,
 * including a revoked one, so it cannot stand in for "connected" on its
 * own. Only a successful `/git/user` call proves the token still works —
 * anything else is `unverified`, and every page offers a way back to GitHub
 * rather than hiding the control until a failure is recognised.
 */
export function useGithubConnection(): GithubConnection {
  const { gitProfile } = useAuthLoggedIn();
  const { resGitUser } = useAuthModel();

  const connect = () => {
    localStorage.setItem('auth:provider', 'github');
    window.location.href = buildGithubAuthUrl(
      buildFrontendReturnUrl(window.location.pathname, window.location.search),
    );
  };

  if (!gitProfile) return { state: 'disconnected', connect };

  if (resGitUser.$status === 'success' && resGitUser.login) {
    return { state: 'connected', login: resGitUser.login, connect };
  }

  if (resGitUser.$status === 'loading') {
    return { state: 'checking', login: gitProfile.login || undefined, connect };
  }

  return { state: 'unverified', login: gitProfile.login || undefined, connect };
}
