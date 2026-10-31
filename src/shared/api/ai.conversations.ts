import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/ai/conversations',
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<{}> = {}) {
  return useApiGet<DTOs.AiConversationV1[]>(recipe(), params.options);
}
