import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';
import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  userId?: string;
  organizationName: string;
  description?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { organizationName, userId, description } = params;

  return {
    method: 'POST',
    url: `/v1/organization/create`,
    data: {
      name: organizationName,
      ...(userId ? { user_id: userId } : {}),
      description,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.OrganizationV1 & {
  workspace_id?: string;
  workspace?: {
    id: string;
    type: string;
    name: string;
    local_organization_id?: string;
    roles?: string[];
  };
};

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
