import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  payload: DTOs.FirewallRuleRequestV2;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload, serverId } = params;

  return {
    method: 'POST',
    url: `/v2/server/${serverId}/firewall/rules`,
    data: payload,
  };
}

export type Dto = DTOs.FirewallRuleV2;

// =============================================================================
//   Method
// =============================================================================

/** Stores a rule; it takes effect on the next apply. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
