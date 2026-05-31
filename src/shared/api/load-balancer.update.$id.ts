import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import { toRulePayload } from './load-balancer.create';
import type { RecipeRule, RecipeRuntimeItem } from './load-balancer.create';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  advanceMode?: boolean;
  config?: DTOs.LoadBalancerConfigV2;
  loadBalancerId: string;
  name?: string;
  defaultUpstream?: string;
  rules?: RecipeRule[];
  runtimeItems?: RecipeRuntimeItem[];
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const {
    advanceMode,
    config,
    defaultUpstream,
    loadBalancerId,
    name,
    rules,
    runtimeItems,
  } = params;

  return {
    method: 'POST',
    url: `/v2/load-balancer/update/${loadBalancerId}`,
    data: {
      ...(advanceMode !== undefined ? { advance_mode: advanceMode } : {}),
      ...(name ? { name } : {}),
      ...(defaultUpstream ? { upstream: defaultUpstream } : {}),
      ...(config ? { config } : {}),
      ...(rules ? { rules: rules.map(toRulePayload) } : {}),
      ...(runtimeItems
        ? {
            runtime_items: runtimeItems.map((item) => ({
              name: item.name,
              title: item.title,
              version: item.version,
              category: item.category,
              roles: item.roles,
              installation_key: item.installationKey,
              variables: item.variables,
              source: item.source,
              module_ref: item.moduleRef,
              module_source_commit: item.moduleSourceCommit,
            })),
          }
        : {}),
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.LoadBalancerV2>({
    ...recipe(params),
  });
}
