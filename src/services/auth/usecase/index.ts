import type { ResponseError } from '@/shared/libs/api-client/rules/types';
import { iife } from '@/shared/libs/browser/fn';

import { useAuthModel } from '../model';

type ApiResponseError = Extract<ResponseError, { kind: 'api' }>;

function getApiErrorStatusCode(error: ApiResponseError['error']) {
  if ('code' in error && typeof error.code === 'number') return error.code;

  if ('response' in error) return error.response?.status ?? error.status;

  return undefined;
}

function isProfileUnauthorizedError(response: ResponseError) {
  if (response.kind !== 'api') return false;

  return getApiErrorStatusCode(response.error) === 401;
}

export function useAuthBase() {
  const { resUserProfile, resGitUser } = useAuthModel();

  if (
    resUserProfile.$status === 'initial' ||
    resUserProfile.$status === 'loading'
  ) {
    return {
      $status: 'loading',
    } as const;
  }

  // Check if failed because OTHER THAN NOT logged in
  const isNotLoggedIn =
    resUserProfile.$status === 'failed' &&
    isProfileUnauthorizedError(resUserProfile);

  if (resUserProfile.$status === 'failed' && !isNotLoggedIn) {
    return {
      $status: 'failed',
      error: resUserProfile.error,
    } as const;
  }

  const mappedResponse = iife(() => {
    if (resUserProfile.$status !== 'success') return null;

    const { user, github } = resUserProfile;

    if (!user) return null;
    const {
      id,
      avatar_url: avatarSrc,
      email,
      username,
      fullname,
      created_at,
    } = user;

    if (!id) return null;

    const userProfile = {
      id: String(id),
      avatarSrc,
      email,
      username,
      fullname,
      createAt: created_at,
    };

    if (!github?.access_token) {
      return {
        userProfile,
        gitProfile: null,
      };
    }

    return {
      userProfile,
      gitProfile: {
        id: Number(github.subject) || 0,
        login: github.nickname || '',
        organizations: [],
        githubAccessToken: github.access_token,
      },
    };
  });

  if (!mappedResponse) {
    return {
      $status: 'success',
      isLoggedIn: false,
    } as const;
  }

  return {
    $status: 'success',
    isLoggedIn: true,
    userProfile: mappedResponse.userProfile,
    gitProfile: iife(() => {
      if (!mappedResponse.gitProfile) return null;

      if (resGitUser.$status !== 'success') return mappedResponse.gitProfile;

      const { id, login, organizations } = resGitUser;

      if (!id || !login) return mappedResponse.gitProfile;

      return {
        id,
        login,
        organizations,
        githubAccessToken: mappedResponse.gitProfile.githubAccessToken,
      };
    }),
  } as const;
}

export function useAuthLoggedIn() {
  const authBase = useAuthBase();

  if (authBase.$status !== 'success' || !authBase.isLoggedIn) {
    throw Error('useAuthLoggedIn is only allowed in a logged in page!');
  }

  const { gitProfile, userProfile } = authBase;

  return {
    gitProfile,
    userProfile,
  };
}
