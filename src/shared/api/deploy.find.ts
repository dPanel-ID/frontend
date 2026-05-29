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
  applicationId: string;
  serverId?: string;
  page?: number;
  limit?: number;
  id?: string;
  order?: string;
  by?: string;
  name?: string;
  source?: string;
  repoOrg?: string;
  repoName?: string;
  userId?: string;
  distinct?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    applicationId,
    serverId,
    page = 1,
    limit = 5,
    id,
    order,
    by,
    name,
    source,
    repoOrg,
    repoName,
    userId,
    distinct,
  } = params;

  const queryParams = createQueryParams({
    application_id: applicationId,
    machine_id: serverId,
    id,
    order,
    by,
    name,
    source,
    repo_org: repoOrg,
    repo_name: repoName,
    user_id: userId,
    distinct,
    page,
    limit,
  });

  return {
    url: `/v1/deploy/find?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  deploys?: DTOs.DeployV1[];
  pagination: DTOs.Pagination;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
