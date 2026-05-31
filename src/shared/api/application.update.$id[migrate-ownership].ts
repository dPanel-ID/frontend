import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { PayloadUpdateOwnership } from './-dtos';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  payload: PayloadUpdateOwnership;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { applicationId, payload } = params;
  const data: DTOs.ApplicationPayloadV1 =
    payload.into === 'team'
      ? {
          workspace_id: payload.teamId,
          workspace_type: 'group',
        }
      : {
          workspace_type: 'personal',
        };

  return {
    method: 'POST',
    url: `/v1/application/update/${applicationId}`,
    data,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.ApplicationV1>({
    ...recipe(params),
  });
}
