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
  /** Part of the hostname. */
  search?: string;
  /** 1-based. */
  page?: number;
  limit?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { limit = 10, page = 1, search } = params;

  const queryParams = createQueryParams({
    page,
    limit,
    hostname: search?.trim() || undefined,
  });

  return {
    url: `/v2/admin/servers?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** What a server card counts without asking the server. */
export interface AdminServerStats {
  applications?: number;
  load_balancers?: number;
}

export interface Dto {
  machines?: DTOs.MachineV1[];
  pagination: DTOs.Pagination;
  /** Keyed by server ID. */
  stats?: Record<string, AdminServerStats>;
}

/**
 * Every workspace's servers, newest first, shaped like the servers page's
 * list. Requires the dpanel-admin role.
 */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
