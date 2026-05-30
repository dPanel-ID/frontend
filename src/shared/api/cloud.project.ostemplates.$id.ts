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
  productId?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, productId } = params;
  const queryParams = new URLSearchParams();

  if (productId != null) {
    queryParams.set('product_id', String(productId));
  }

  const queryString = queryParams.toString();

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/ostemplates${queryString ? `?${queryString}` : ''}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface OsTemplateItem {
  id: string;
  name: string;
  os_name?: string;
  os_version?: string;
}

export type Dto = OsTemplateItem[];

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
