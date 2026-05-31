import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  DoRequestRecipe,
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  domainId: string;
  recordId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { domainId, recordId } = params;

  return {
    url: `/v1/domain/origin/${domainId}/${recordId}`,
  };
}

export function recipeDelete(params: RecipeParams): DoRequestRecipe {
  return {
    ...recipe(params),
    method: 'DELETE',
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.DomainRecordDetailResponseV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

export function fetchGet(params: RecipeParams) {
  return apiClient<Dto>({
    ...recipe(params),
    method: 'GET',
  });
}

export function doDelete(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipeDelete(params),
  });
}
