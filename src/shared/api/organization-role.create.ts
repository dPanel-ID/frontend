import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  organizationId: string;
  name: string;
  description?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { organizationId, name, description } = params;

  return {
    method: 'POST',
    url: `/v1/organization-role/create`,
    data: {
      organization_id: organizationId,
      name,
      description,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationRoleV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
