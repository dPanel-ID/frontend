import { workspaceHeaders } from '@/shared/libs/api-client/config';
import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

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
    method: 'POST',
    url: `/v1/workers/${encodeURIComponent(id)}/token`,
    headers: workspaceHeaders(workspaceId),
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Replaces a VM worker's token; the new one comes back once. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.WorkerSecretV1>({
    ...recipe(params),
  });
}
