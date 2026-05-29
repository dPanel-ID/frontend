import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  orgId: string;
  payload: {
    name: string;
    description?: string;
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { orgId, payload } = params;

  return {
    method: 'POST',
    url: `/v1/organization/update/${orgId}`,
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
