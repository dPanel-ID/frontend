import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

export interface RecipeParams {
  serverId: string;
  payload: {
    username: string;
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { serverId, payload } = params;

  return {
    method: 'POST',
    url: `/v1/server/origin/${serverId}/user/delete`,
    data: payload,
  };
}

export function doDelete(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}