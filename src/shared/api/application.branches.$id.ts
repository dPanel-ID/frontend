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
  applicationId: string;
}

/**
 * The application's branches, read by dPanel through its GitHub App: the
 * user's own GitHub connection is not needed once the application exists.
 */
export function recipe(params: RecipeParams): GetRequestRecipe {
  const { applicationId } = params;

  return {
    url: `/v1/application/${applicationId}/branches`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.GitBranchV1[]>(recipe(params), params.options);
}
