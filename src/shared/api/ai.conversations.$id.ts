import { apiClient } from '@/shared/libs/api-client/lib/client';
import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  conversationId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { conversationId } = params;

  return {
    url: `/v1/ai/conversations/${encodeURIComponent(conversationId)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function fetchGet(params: RecipeParams) {
  return apiClient<DTOs.AiConversationDetailV1>({
    ...recipe(params),
    method: 'GET',
  });
}
