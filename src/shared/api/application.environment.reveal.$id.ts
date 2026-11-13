import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
}

/** One variable with its value in clear. */
export interface RevealedVariable {
  key: string;
  value: string;
}

export interface Dto {
  run: RevealedVariable[];
  build: RevealedVariable[];
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/application/${params.applicationId}/environment/reveal`,
    data: {},
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * Reads an application's variable values, which every other response masks.
 * Needs permission to change the application; the API logs each call.
 */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
