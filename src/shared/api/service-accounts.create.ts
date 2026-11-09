import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import { serviceAccountsUrl } from './service-accounts.url';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  name: string;
  description: string;
  role?: string;
  expiresInDays: number;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: serviceAccountsUrl(params.workspaceId),
    data: {
      name: params.name,
      description: params.description,
      role: params.role,
      expires_in_days: params.expiresInDays,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Creates an account. Its first token comes back once, in this response. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.ServiceAccountCreatedV1>({ ...recipe(params) });
}
