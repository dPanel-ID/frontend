import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
  /** On a private server: reinstall an agent that is already current. */
  force?: boolean;
}

/** What setup answers for a private server. */
export interface AgentSetupResult {
  skipped?: boolean;
  version?: string;
  execution_id?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id, force } = params;

  return {
    method: 'POST',
    url: `/v1/server/setup/${id}${force ? '?force=true' : ''}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<AgentSetupResult>({
    ...recipe(params),
  });
}
