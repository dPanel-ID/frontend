import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  domainId: string;
  page?: number;
  /** Records per page; the API's default when unset. */
  limit?: number;
  /** Keeps records whose name or content contains it, ignoring case. */
  search?: string;
  /** Keeps one record type, such as `A` or `CNAME`. */
  type?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { domainId, limit, page = 1, search, type } = params;

  const queryParams = new URLSearchParams({ page: String(page) });
  if (limit) queryParams.set('limit', String(limit));
  if (search) queryParams.set('search', search);
  if (type) queryParams.set('type', type);

  return {
    url: `/v1/domain/origin/${domainId}?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.DomainRecordListResponseV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

export function fetchGet(params: RecipeParams) {
  return apiClient<Dto>({
    ...recipe(params),
    method: 'GET',
  });
}
