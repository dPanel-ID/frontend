import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  userId: string;
  payload: {
    fullname: string;
    username: string;
    password: string;
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { userId, payload } = params;

  return {
    method: 'POST',
    url: `/v1/user/update/${userId}`,
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.User;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
