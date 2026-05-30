import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  ref?: string;
}

export function recipe(params?: RecipeParams): GetRequestRecipe {
  const { ref } = params ?? {};
  const queryParams = createQueryParams({
    ref,
  });

  return {
    url: `/v1/iac/repository?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.IACRepositoryV1;

export function useGet(params?: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params?.options);
}
