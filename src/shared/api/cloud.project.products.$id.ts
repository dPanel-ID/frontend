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
    url: `/v1/cloud/project/detail/${cloudProjectId}/products`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface ProductBillingCycleItem {
  cycle?: string;
  label?: string;
  price?: string;
}

export interface ProductItem {
  billing_cycles?: ProductBillingCycleItem[];
  default_cycle?: string;
  description?: string;
  disk_gb?: number;
  id?: number;
  metadata?: Record<string, unknown>;
  name?: string;
  ram_mb?: number;
  vcpu?: number;
}

export interface Dto {
  items?: ProductItem[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
