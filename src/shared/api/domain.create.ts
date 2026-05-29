import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  domain: string;
  description?: string;
  provider: string;
  credential: Record<string, string>;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { domain, description, provider, credential } = params;

  return {
    method: 'POST',
    url: `/v1/domain/create`,
    data: {
      domain,
      name: description,
      provider,
      credential,
      is_public: false,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  id: string;
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
