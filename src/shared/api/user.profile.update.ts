import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { Dto as ProfileDto } from './user.profile';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  payload: {
    avatar?: string;
    avatar_url?: string;
    displayName?: string;
    fullname?: string;
    password?: string;
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload } = params;

  return {
    method: 'POST',
    url: '/v1/user/profile',
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
