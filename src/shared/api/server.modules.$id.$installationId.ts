import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  installationId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { serverId, installationId } = params;

  return {
    method: 'DELETE',
    url: `/v1/server/${serverId}/modules/${installationId}`,
  };
}

export type Dto = DTOs.ModuleInstallationV1;

// =============================================================================
//   Method
// =============================================================================

export function doDelete(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
