import { apiDoPost, useApiGet } from '@/shared/libs/api-client';
import type {
  DoRequestRecipe,
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId } = params;

  return {
    url: `/v2/server/${serverId}/firewall`,
  };
}

export interface PutRecipeParams extends RecipeParams {
  payload: DTOs.FirewallPolicyRequestV2;
}

export function recipePut(params: PutRecipeParams): DoRequestRecipe {
  const { payload, serverId } = params;

  return {
    method: 'PUT',
    url: `/v2/server/${serverId}/firewall`,
    data: payload,
  };
}

export type Dto = DTOs.FirewallV2;

// =============================================================================
//   Method
// =============================================================================

/** The stored firewall: policy, rules (system rules first), applied state. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

/** Changes the policy; `version` must match the loaded one or the API returns 409. */
export function doPut(params: PutRecipeParams) {
  return apiDoPost<Dto>({
    ...recipePut(params),
  });
}
