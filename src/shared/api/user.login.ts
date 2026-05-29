import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { Dto as ProfileDto } from './user.profile';

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

export type Dto = ProfileDto;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
