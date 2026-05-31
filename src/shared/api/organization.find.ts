import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import useApiGetLazy from '@/shared/libs/api-client/hooks/useApiGetLazy';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id?: string;
  name?: string;
  status?: string;
  order?: string;
  by?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { id, name, status, order, by, page, pageSize, limit } = params;

  const queryParams = createQueryParams({
    id,
    name,
    status,
    order,
    by,
    page,
    limit: limit ?? pageSize,
  });

  return {
    url: `/v1/organization/find?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  organizations?: DTOs.OrganizationV1[];
  pagination: DTOs.Pagination;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

export function useGetLazy() {
  return useApiGetLazy<Dto, RecipeParams>(recipe);
}
