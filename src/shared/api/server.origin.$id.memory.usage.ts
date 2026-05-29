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
    url: `v1/server/origin/${serverId}/memory/usage`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  active: number;
  active_humanize?: string;
  available: number;
  available_humanize?: string;
  free: number;
  free_humanize?: string;
  inactive: number;
  inactive_humanize?: string;
  total: number;
  total_humanize?: string;
  used: number;
  used_humanize?: string;
  used_percent: number;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
