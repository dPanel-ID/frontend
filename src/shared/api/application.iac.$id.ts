import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { applicationId } = params;

  return {
    url: `/v1/application/${applicationId}/iac`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.ApplicationIACConfigV1>(recipe(params), params.options);
}
