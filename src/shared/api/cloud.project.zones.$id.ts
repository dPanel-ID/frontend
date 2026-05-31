import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  region?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, region } = params;
  const queryParams = new URLSearchParams();

  if (region) {
    queryParams.set('region', region);
  }

  const queryString = queryParams.toString();

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/zones${queryString ? `?${queryString}` : ''}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface ZoneItem {
  id: string;
  name: string;
}

export interface Dto {
  items?: ZoneItem[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

export function fetchGet(params: RecipeParams) {
  return apiClient<Dto>({
    ...recipe(params),
    method: 'GET',
  });
}
