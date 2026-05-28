import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
}

export interface Dto {
  machine_id: string;
  status: string;
  deletion_phase: 'agent_uninstall' | 'permanent' | string;
  execution_id?: string;
  permanent_deleted: boolean;
  agent_uninstalling: boolean;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id } = params;

  return {
    method: 'DELETE',
    url: `/v1/server/delete/${id}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doDelete(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
