import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  executionId: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { executionId } = params;

  return {
    method: 'POST',
    url: `/v2/admin/tasks/${encodeURIComponent(executionId)}/reclaim`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Hands the task to the next free worker. Requires dpanel-admin. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.AdminTaskReclaimV2>({
    ...recipe(params),
  });
}
