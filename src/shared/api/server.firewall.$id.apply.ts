import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  payload: DTOs.FirewallApplyRequestV2;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload, serverId } = params;

  return {
    method: 'POST',
    url: `/v2/server/${serverId}/firewall/apply`,
    data: payload,
  };
}

export type Dto = DTOs.FirewallExecutionV2;

// =============================================================================
//   Method
// =============================================================================

/** Queues the job that converges the server to the stored firewall. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
