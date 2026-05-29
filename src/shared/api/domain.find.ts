import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  filterQuery?: {
    id?: string;
    providerName?: string;
    type?: string;
    name?: string;
    domain?: string;
    isPublic?: boolean;
  };
  order?: string;
  by?: string;
  page?: number;
  perPage?: number;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { by, filterQuery, order, page = 1, perPage = 5 } = params;

  const queryParams = createQueryParams({
    page,
    limit: perPage,
    order,
    by,
    id: filterQuery?.id,
    provider: filterQuery?.providerName,
    type: filterQuery?.type,
    name: filterQuery?.name,
    domain: filterQuery?.domain,
    is_public: filterQuery?.isPublic,
  });

  return {
    url: `/v1/domain/find?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  domains?: DTOs.DomainV1[];
  pagination: DTOs.Pagination;
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
