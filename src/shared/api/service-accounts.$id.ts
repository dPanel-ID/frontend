import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import { serviceAccountsUrl } from './service-accounts.url';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  id: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'DELETE',
    url: serviceAccountsUrl(
      params.workspaceId,
      `/${encodeURIComponent(params.id)}`,
    ),
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Deletes an account and revokes all its tokens. */
export function doDelete(params: RecipeParams) {
  return apiDoPost({ ...recipe(params) });
}
