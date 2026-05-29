import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  loadBalancerId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { loadBalancerId } = params;

  return {
    method: 'DELETE',
    url: `/v2/load-balancer/delete/${loadBalancerId}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doDelete(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
