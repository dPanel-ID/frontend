import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  organizationId: string;
  key: string;
  value: string;
  isPublic?: boolean;
  id?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { organizationId, key, value, isPublic, id } = params;

  return {
    method: 'POST',
    url: `/v1/organization-config/create`,
    data: {
      id,
      organization_id: organizationId,
      key,
      value,
      is_public: isPublic,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationConfigV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
