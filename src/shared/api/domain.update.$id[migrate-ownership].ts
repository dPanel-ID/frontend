import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { PayloadUpdateOwnership } from './-dtos';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  domainId: string;
  payload: PayloadUpdateOwnership;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { domainId, payload } = params;

  return {
    method: 'POST',
    url: `/v1/domain/update/${domainId}`,
    data:
      payload.into === 'team'
        ? {
            workspace_id: payload.teamId,
            workspace_type: 'group',
          }
        : {
            workspace_type: 'personal',
          },
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.DomainV1;

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
