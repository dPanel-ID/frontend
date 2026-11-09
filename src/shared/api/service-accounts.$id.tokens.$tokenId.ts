import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import { serviceAccountsUrl } from './service-accounts.url';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  id: string;
  tokenId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'DELETE',
    url: serviceAccountsUrl(
      params.workspaceId,
      `/${encodeURIComponent(params.id)}/tokens/${encodeURIComponent(params.tokenId)}`,
    ),
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Revokes one token; it stops working at once. */
export function doDelete(params: RecipeParams) {
  return apiDoPost({ ...recipe(params) });
}
