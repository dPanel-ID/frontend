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
  deploymentId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/deploy/${encodeURIComponent(params.deploymentId)}/releases`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** The release folders of one deployment (an app on one server). */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.DeployReleasesV1>(recipe(params), params.options);
}
