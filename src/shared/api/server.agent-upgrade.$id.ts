import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/server/${params.id}/agent/upgrade`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  command_id?: string;
  /** The release the agent is moving to. */
  version?: string;
}

/** Queues an upgrade of the server's agent to the latest release. */
export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>(recipe(params));
}
