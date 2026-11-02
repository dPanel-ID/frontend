import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  payload: DTOs.FirewallDisableRequestV2;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload, serverId } = params;

  return {
    method: 'POST',
    url: `/v2/server/${serverId}/firewall/disable`,
    data: payload,
  };
}

export type Dto = DTOs.FirewallExecutionV2;

// =============================================================================
//   Method
// =============================================================================

/** Stores the policy as disabled and queues the job that turns ufw off. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
