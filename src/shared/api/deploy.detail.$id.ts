import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  id: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/deploy/detail/${params.id}`,
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.DeployV1>(recipe(params), params.options);
}

export function fetchGet(params: RecipeParams) {
  return apiClient<DTOs.DeployV1>({
    ...recipe(params),
    method: 'GET',
  });
}
