import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  deploymentId: string;
  /** A release name; empty lets the server pick the previous one. */
  release: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/deploy/${encodeURIComponent(params.deploymentId)}/rollback`,
    data: { release: params.release },
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * Switches the live release on that server back. Only the code changes:
 * variables and settings stay, release commands do not run and database
 * migrations are not rolled back.
 */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.DeployRollbackV1>(recipe(params));
}
