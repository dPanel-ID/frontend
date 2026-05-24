import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId } = params;

  return {
    url: `v1/server/origin/${serverId}/cpu`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  value?: number;
  cpu_core?: number;
  core_count?: number;
  coreCount?: number;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
