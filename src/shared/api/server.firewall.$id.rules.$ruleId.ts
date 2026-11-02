import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  ruleId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { ruleId, serverId } = params;

  return {
    method: 'DELETE',
    url: `/v2/server/${serverId}/firewall/rules/${encodeURIComponent(ruleId)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Removes a stored rule; locked rules are refused with 409. */
export function doDelete(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
