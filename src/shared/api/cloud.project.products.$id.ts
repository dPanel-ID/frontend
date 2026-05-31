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
  zone?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, zone } = params;
  const queryParams = new URLSearchParams();

  if (zone) {
    queryParams.set('zone', zone);
  }

  const queryString = queryParams.toString();

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/products${queryString ? `?${queryString}` : ''}`,
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
  value?: string;
  vcpu?: number;
}

export interface Dto {
  items?: ProductItem[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
