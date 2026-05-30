import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId } = params;

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/billing-accounts`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface BillingAccountItem {
  can_pay?: boolean;
  id?: number;
  is_active?: boolean;
  is_default?: boolean;
  name?: string;
  title?: string;
}

export interface Dto {
  items?: BillingAccountItem[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
