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
  /** Most tasks to return, oldest first. */
  limit?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { limit = 200 } = params;

  const queryParams = createQueryParams({ limit });

  return {
    url: `/v2/admin/tasks?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.AdminTaskV2[];

/** Unfinished tasks of every workspace. Requires the dpanel-admin role. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
