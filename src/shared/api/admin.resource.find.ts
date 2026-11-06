import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export type AdminResourceType =
  | 'servers'
  | 'applications'
  | 'load_balancers'
  | 'domains'
  | 'ssh_keys';

export interface RecipeParams {
  type: AdminResourceType;
  /** Part of the name or detail, any case. */
  search?: string;
  /** 1-based. */
  page?: number;
  limit?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { limit = 50, page = 1, search, type } = params;

  const queryParams = createQueryParams({
    type,
    page,
    limit,
    search: search?.trim() || undefined,
  });

  return {
    url: `/v2/admin/resources?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.AdminResourceListV2;

/**
 * Every user's and team's resources of one type, newest first. Requires the
 * dpanel-admin role.
 */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
