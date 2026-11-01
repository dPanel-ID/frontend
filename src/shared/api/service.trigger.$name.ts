import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serviceName: string;
  eventName: string;
  serverId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { serviceName, eventName, serverId } = params;

  return {
    method: 'POST',
    url: `/v1/service/trigger/${serviceName}`,
    data: {
      event: eventName,
      // The API reads machine_id as a number.
      machine_id: Number(serverId),
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
