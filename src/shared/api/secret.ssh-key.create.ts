import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  keyLength: number;
  displayName: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { displayName, keyLength } = params;

  return {
    method: 'POST',
    url: `/v1/secret/ssh-key/create`,
    data: {
      key_size: keyLength,
      name: displayName,
      type: 'ssh-key',
      key_prefix: '',
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
