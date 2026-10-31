import { apiClient } from '@/shared/libs/api-client/lib/client';
import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  turnId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { turnId } = params;

  return {
    url: `/v1/ai/turns/${encodeURIComponent(turnId)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function fetchGet(params: RecipeParams) {
  return apiClient<DTOs.AiTurnV1>({
    ...recipe(params),
    method: 'GET',
  });
}
