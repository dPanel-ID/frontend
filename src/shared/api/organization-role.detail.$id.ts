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
  id: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { id } = params;

  return {
    url: `/v1/organization-role/detail/${id}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationRoleV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
