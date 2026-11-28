import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
  /**
   * Apps using release folders keep their shared folder (uploads, storage,
   * .env, SQLite) unless this is true. No effect on other apps.
   */
  deleteData?: boolean;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id, deleteData } = params;

  return {
    method: 'DELETE',
    url: `/v1/deploy/delete/${id}${deleteData ? '?delete_data=true' : ''}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doDelete(params: RecipeParams) {
  return apiDoPost<boolean>({
    ...recipe(params),
  });
}
