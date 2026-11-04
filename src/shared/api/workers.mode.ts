import { workspaceHeaders } from '@/shared/libs/api-client/config';
import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  workspaceId: string;
  mode: DTOs.WorkersModeV1;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { mode, workspaceId } = params;

  return {
    method: 'PUT',
    url: '/v1/workers/mode',
    headers: workspaceHeaders(workspaceId),
    data: { mode },
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Switches the workspace between shared and private workers (409 if empty). */
export function doPut(params: RecipeParams) {
  return apiDoPost<DTOs.WorkersConfigV1>({
    ...recipe(params),
  });
}
