import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  ref?: string;
  serverId?: string;
}

export function recipe(params?: RecipeParams): GetRequestRecipe {
  const { ref, serverId } = params ?? {};
  const queryParams = createQueryParams({
    ref,
    server_id: serverId,
  });

  return {
    url: `/v1/modules?${queryParams.toString()}`,
  };
}

export interface Dto {
  repository: DTOs.IACRepositorySummaryV1;
  modules: DTOs.ModuleCatalogItemV1[];
}

export function useGet(params?: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params?.options);
}
