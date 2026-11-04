import { workspaceHeaders } from '@/shared/libs/api-client/config';
import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  id: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id, workspaceId } = params;

  return {
    method: 'DELETE',
    url: `/v1/workers/${encodeURIComponent(id)}`,
    headers: workspaceHeaders(workspaceId),
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Removes a worker; refused (409) for the last one of a private workspace. */
export function doDelete(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
