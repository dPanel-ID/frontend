import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  payload: DTOs.ApplicationPayloadV1 & Record<string, unknown>;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { payload } = params;

  return {
    method: 'POST',
    url: `/v1/application/create`,
    data: stripLegacyOwnershipFields(payload),
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

function stripLegacyOwnershipFields(
  payload: DTOs.ApplicationPayloadV1 & Record<string, unknown>,
) {
  const nextPayload = { ...payload };
  delete nextPayload.local_organization_id;
  delete nextPayload.organization_id;
  delete nextPayload.user_id;

  return nextPayload;
}
