import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

export interface RecipeParams {
  serverId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { serverId } = params;

  return {
    method: 'POST',
    url: `/v1/server/${serverId}/modules/refresh`,
  };
}

export type Dto = DTOs.ServerModuleInventoryV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
