import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
}

export interface Dto {
  agent_uninstalling?: boolean;
  deletion_phase?: 'agent_uninstall' | 'origin_delete' | 'permanent' | string;
  execution_id?: string;
  machine_id?: string;
  origin_deleting?: boolean;
  origin_provider?: string;
  permanent_deleted?: boolean;
  status?: string;
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
