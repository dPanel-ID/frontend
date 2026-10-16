import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** Curated catalog; ubuntu-lts returns one image per supported Ubuntu LTS release. */
  catalog?: 'ubuntu-lts';
  cloudProjectId: string;
  filter?: string;
  osFamily?: string;
  productId?: number;
  tier?: string;
  zone?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { catalog, cloudProjectId, filter, osFamily, productId, tier, zone } =
    params;
  const queryParams = new URLSearchParams();

  if (catalog) {
    queryParams.set('catalog', catalog);
  }

  if (productId != null) {
    queryParams.set('product_id', String(productId));
  }

  if (zone) {
    queryParams.set('zone', zone);
  }

  if (filter) {
    queryParams.set('filter', filter);
  }

  if (osFamily) {
    queryParams.set('os_family', osFamily);
  }

  if (tier) {
    queryParams.set('tier', tier);
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
