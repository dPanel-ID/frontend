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
    method: 'DELETE',
    url: `/v2/admin/tasks/${encodeURIComponent(executionId)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Marks the task as failed and stops its worker. Requires dpanel-admin. */
export function doDelete(params: RecipeParams) {
  return apiDoPost<DTOs.AdminTaskDeleteV2>({
    ...recipe(params),
  });
}
