import { createQueryParams } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  branch: string;
}

/**
 * One application branch and its head commit, read by dPanel through its
 * GitHub App, so building needs no GitHub connection of the user's own.
 */
export function recipe(params: RecipeParams): GetRequestRecipe {
  const { applicationId, branch } = params;

  const queryParams = createQueryParams({
    name: branch,
  });

  return {
    url: `/v1/application/${applicationId}/branch?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function fetchGet(params: RecipeParams) {
  return apiClient<DTOs.GitBranchV1>({
    ...recipe(params),
    method: 'GET',
  });
}
