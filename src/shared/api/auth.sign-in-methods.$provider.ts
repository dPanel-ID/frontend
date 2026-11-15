import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

/** The sign-in methods that can be removed from an account. */
export type UnlinkableProvider = 'google' | 'github';

export interface RecipeParams {
  provider: UnlinkableProvider;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'DELETE',
    url: `/v1/auth/sign-in-methods/${params.provider}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * Removes a sign-in method. The API answers 409 when it is the account's
 * last way to sign in.
 */
export function doDelete(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
