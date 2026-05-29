import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  domainId: string;
  payload: DTOs.CloudFlarePayload;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { domainId, payload } = params;

  return {
    method: 'POST',
    url: `/v1/domain/origin/${domainId}/create`,
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.CloudFlareDetailResponse;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
