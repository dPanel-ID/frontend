import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/auth/sign-in-methods',
  };
}

// =============================================================================
//   Method
// =============================================================================

/** One way to sign in to the account, as the API reports it. */
export interface SignInMethodDto {
  provider?: string;
  linked?: boolean;
  /** GitHub only: the linked GitHub login. */
  username?: string | null;
  /** False when removing it would leave no way to sign in. */
  can_unlink?: boolean;
}

export interface Dto {
  methods?: SignInMethodDto[] | null;
}

/** The ways the signed-in person can sign in (password, Google, GitHub). */
export function useGet(params?: WithApiGetOptions) {
  return useApiGet<Dto>(recipe(), params?.options);
}
