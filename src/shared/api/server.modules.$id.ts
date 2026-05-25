import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId } = params;

  return {
    url: `/v1/server/${serverId}/modules`,
  };
}

export type Dto = DTOs.ServerModuleInventoryV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
