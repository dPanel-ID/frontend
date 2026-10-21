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
  machineId?: string;
  /** Exact agent status. */
  status?: string;
  limit?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { machineId, status, limit = 100 } = params;

  const queryParams = createQueryParams({
    machine_id: machineId,
    status,
    limit,
  });

  return {
    url: `/v2/agents?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.AgentV2[];

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
