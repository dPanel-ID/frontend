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
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { domainId, page = 1 } = params;

  return {
    url: `/v1/domain/origin/${domainId}?page=${page}`,
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
