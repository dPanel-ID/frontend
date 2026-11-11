import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoGet } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  /** Limits the scan to one region (GCP: region or zone). */
  region?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId } = params;
  const region = params.region?.trim();
  const query = region ? `?${new URLSearchParams({ region }).toString()}` : '';

  return {
    url: `/v1/cloud/project/detail/${encodeURIComponent(cloudProjectId)}/orphans${query}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/**
 * Scans the provider for VMs dPanel created that have no server any more.
 * A scan can take tens of seconds, so it runs on demand, not on mount.
 */
export function doGet(
  params: RecipeParams,
  options: { signal?: AbortSignal } = {},
) {
  return apiDoGet<DTOs.CloudOrphanListV1>(recipe(params), options);
}
