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
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId } = params;

  return {
    url: `/v2/server/${serverId}/firewall/plan`,
  };
}

export type Dto = DTOs.FirewallPlanV2;

// =============================================================================
//   Method
// =============================================================================

/** Desired against live, read through the agent. Changes nothing. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
