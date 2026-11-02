import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  username: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { username } = params;

  return {
    url: `/v1/user/username/${encodeURIComponent(username)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** A user's public profile: never their email. */
export type Dto = DTOs.UserPublicV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
