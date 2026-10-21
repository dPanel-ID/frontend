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
  id?: string;
  /** Backend `installer_status` filter: ready, progress, failed and so on. */
  installerStatus?: string;
  machineId?: string;
  order?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  searchQuery?: string | null;
  type?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    by,
    domain,
    engine,
    id,
    installerStatus,
    machineId,
    order,
    page,
    pageSize,
    limit,
    searchQuery,
    type,
  } = params;

  const queryParams = createQueryParams({
    application_id: applicationId,
    by,
    domain,
    engine,
    id,
    installer_status: installerStatus || undefined,
    machine_id: machineId,
    name: searchQuery,
    order,
    page,
    limit: limit ?? pageSize,
    type,
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
