import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
  credential: Record<string, unknown>;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { credential, id } = params;

  return {
    method: 'POST',
    url: `/v1/cloud/project/update/${encodeURIComponent(id)}/credentials`,
    data: {
      credential,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
