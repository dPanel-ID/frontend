import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  organizationName: string;
  description?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { organizationName, description } = params;

  return {
    method: 'POST',
    url: `/v1/organization/create`,
    data: {
      name: organizationName,
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
    roles?: string[];
  };
};

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
