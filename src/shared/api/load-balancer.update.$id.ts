import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { RecipeRule } from './load-balancer.create';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  loadBalancerId: string;
  defaultUpstream?: string;
  rules: RecipeRule[];
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { defaultUpstream, loadBalancerId, rules } = params;

  return {
    method: 'POST',
    url: `/v2/load-balancer/update/${loadBalancerId}`,
    data: {
      advance_mode: true,
      ...(defaultUpstream ? { upstream: defaultUpstream } : {}),
      rules: rules.map((rule) => ({
        path_match: rule.pathMatch,
        type: rule.type,
        wildcard: rule.wildcard,
        target: {
          application_id: rule.applicationId,
          upstreams: rule.upstreams,
        },
      })),
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  id?: string;
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
