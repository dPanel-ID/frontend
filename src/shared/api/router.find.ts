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
  by?: string;
  domain?: string;
  engine?: string;
  forceMine?: boolean;
  id?: string;
  machineId?: string;
  order?: string;
  page?: number;
  pageSize?: number;
  refreshIntervalMs?: number;
  searchQuery?: string | null;
  type?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    by,
    domain,
    engine,
    forceMine,
    id,
    machineId,
    order,
    page,
    pageSize,
    searchQuery,
    type,
  } = params;

  const queryParams = createQueryParams({
    application_id: applicationId,
    by,
    domain,
    engine,
    name: searchQuery,
    id,
    machine_id: machineId,
    order,
    page,
    limit: pageSize,
    type,
    force_mine: forceMine,
  });

  return {
    url: `/v2/load-balancer/find?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  routers?: DTOs.RouterV1[];
  pagination: DTOs.Pagination;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
