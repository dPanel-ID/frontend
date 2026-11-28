import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  payload: DTOs.ApplicationPreflightPayloadV1;
}

/**
 * Checks a definition against what the repository asks for (PHP version and
 * extensions, Node.js version) before anything is deployed.
 */
export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/application/preflight`,
    data: params.payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.ApplicationPreflightV1>({
    ...recipe(params),
  });
}
