import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { Dto as ProfileDto } from './user.profile';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  payload: {
    username: string;
    email: string;
    password: string;
    confirm: string;
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload } = params;

  return {
    method: 'POST',
    url: `/v1/auth/register`,
    data: payload,
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
