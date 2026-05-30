import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
  payload: {
    organization_id: string;
    user_id?: string;
    role?: string;
    role_id?: string;
    roles?: string[];
  };
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id, payload } = params;

  return {
    method: 'POST',
    url: `/v1/organization-people/update/${id}`,
    data: payload,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationPeopleV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
