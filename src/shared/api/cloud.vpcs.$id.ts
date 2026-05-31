import { useAdapter, useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  productId?: number | string;
  regionSlug: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, productId, regionSlug } = params;
  const queryParams = new URLSearchParams();

  if (productId != null) {
    queryParams.set('product_id', String(productId));
  }

  const queryString = queryParams.toString();

  return {
    url: `/v1/cloud/project/detail/${cloudProjectId}/vpcs/${regionSlug}${queryString ? `?${queryString}` : ''}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface NetworkItem {
  id?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  network?: string;
  region?: string;
  subnet?: string;
}

export interface Dto {
  items?: NetworkItem[];
}

type ContractDto = Dto | Dto[];

function normalizeVpcs(raw: ContractDto): Dto {
  if (!Array.isArray(raw)) {
    return {
      items: raw.items ?? [],
    };
  }

  return {
    items: raw.flatMap((group) => group.items ?? []),
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<ContractDto>(
    recipe(params),
    params.options,
  );

  return [useAdapter(response, normalizeVpcs), refresh] as const;
}

export function fetchGet(params: RecipeParams) {
  return apiClient<ContractDto>({
    ...recipe(params),
    method: 'GET',
  });
}
