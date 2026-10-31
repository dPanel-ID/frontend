import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  payload: DTOs.AiChatPayloadV1;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload } = params;

  return {
    method: 'POST',
    url: '/v1/ai/chat',
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.AiChatResultV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
