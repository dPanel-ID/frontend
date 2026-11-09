import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import { serviceAccountsUrl } from './service-accounts.url';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  id: string;
  name: string;
  expiresInDays: number;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: serviceAccountsUrl(
      params.workspaceId,
      `/${encodeURIComponent(params.id)}/tokens`,
    ),
    data: { name: params.name, expires_in_days: params.expiresInDays },
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Adds a token. Its secret comes back once, in this response. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.ServiceAccountTokenCreatedV1>({ ...recipe(params) });
}
