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
    url: `v1/server/origin/${serverId}/disk/usage?path=/`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  free: number;
  free_humanize?: string;
  used: number;
  used_humanize?: string;
  total: number;
  total_humanize?: string;
  used_percent?: number;
  fstype?: string;
  path: string;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
