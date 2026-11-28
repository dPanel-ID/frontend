import { apiDoGet, createQueryParams } from '@/shared/libs/api-client';
import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  owner: string;
  repo: string;
  branch?: string;
  /** Build folder inside the repository, for a monorepo. */
  folder?: string;
  /** The load balancer domain, when known: it becomes APP_URL. */
  domain?: string;
}

/**
 * The settings dPanel suggests for a repository it recognises (Laravel
 * today): runtimes, build, release, run and health check. Repositories it
 * does not recognise answer with `detected: false`.
 */
export function recipe(params: RecipeParams): GetRequestRecipe {
  const queryParams = createQueryParams({
    owner: params.owner,
    repo: params.repo,
    branch: params.branch || undefined,
    folder: params.folder || undefined,
    domain: params.domain || undefined,
  });

  return {
    url: `/v1/application/preset?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doGet(
  params: RecipeParams,
  options: { signal?: AbortSignal } = {},
) {
  return apiDoGet<DTOs.ApplicationPresetV1>(recipe(params), options);
}
