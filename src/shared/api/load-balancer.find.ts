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
  applicationId?: string;
  forceMine?: boolean;
  machineId?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  searchQuery?: string | null;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    forceMine,
    machineId,
    page,
    pageSize,
    limit,
    searchQuery,
  } = params;

  const queryParams = createQueryParams({
    application_id: applicationId,
    force_mine: forceMine,
    machine_id: machineId,
    name: searchQuery,
    page,
    limit: limit ?? pageSize,
  });

  return {
    url: `/v2/load-balancer/find?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  routers?: DTOs.LoadBalancerV2[];
  pagination: DTOs.Pagination;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
