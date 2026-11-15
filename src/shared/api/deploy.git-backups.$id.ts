import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoGet } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  deploymentId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/deploy/${encodeURIComponent(params.deploymentId)}/git-backups`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** The deployment's latest backups to git, newest first. */
export function doGet(
  params: RecipeParams,
  options: { signal?: AbortSignal } = {},
) {
  return apiDoGet<DTOs.GitBackupV1[] | null>(recipe(params), options);
}
