import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  payload: DTOs.FirewallImportRequestV2;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload, serverId } = params;

  return {
    method: 'POST',
    url: `/v2/server/${serverId}/firewall/import`,
    data: payload,
  };
}

export type Dto = DTOs.FirewallImportV2;

// =============================================================================
//   Method
// =============================================================================

/** Adopts the server's current ufw rules as stored rules. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
