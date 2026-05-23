import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  username: string;
  email?: string;
  password: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { username, email, password } = params;

  return {
    method: 'POST',
    url: `/v1/auth/login`,
    data: {
      username,
      email: email ?? username,
      password,
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
