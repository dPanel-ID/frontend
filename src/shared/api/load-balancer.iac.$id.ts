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
  loadBalancerId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { loadBalancerId } = params;

  return {
    url: `/v2/load-balancer/${loadBalancerId}/iac`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.LoadBalancerIACConfigV2>(
    recipe(params),
    params.options,
  );
}
