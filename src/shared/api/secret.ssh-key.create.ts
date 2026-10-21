import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** "ed25519" or "rsa". Omitted lets the backend pick its default. */
  algorithm?: string;
  /** RSA only: Ed25519 has no size to choose. */
  keyLength?: number;
  displayName: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { algorithm, displayName, keyLength } = params;

  return {
    method: 'POST',
    url: `/v1/secret/ssh-key/create`,
    data: {
      name: displayName,
      type: 'ssh-key',
      key_prefix: '',
      ...(algorithm ? { algorithm } : {}),
      ...(keyLength ? { key_size: keyLength } : {}),
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost({
    ...recipe(params),
  });
}
