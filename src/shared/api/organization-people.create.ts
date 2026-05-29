import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  userId: string;
  organizationId: string;
  roleId?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { organizationId, userId, roleId } = params;

  return {
    method: 'POST',
    url: `/v1/organization-people/create`,
    data: {
      organization_id: organizationId,
      user_id: userId,
      ...(roleId ? { role_id: roleId } : {}),
    },
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
