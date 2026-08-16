import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  page?: number;
  limit?: number;
}

export function recipe(_params: RecipeParams = {}): GetRequestRecipe {
  return {
    url: '/v1/host-groups',
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.HostGroupV1[]>(recipe(params), params.options);
}
