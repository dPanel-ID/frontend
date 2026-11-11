import type { GetRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoGet } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  executionId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { cloudProjectId, executionId } = params;

  return {
    url: `/v1/cloud/project/detail/${encodeURIComponent(cloudProjectId)}/orphans/executions/${encodeURIComponent(executionId)}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Reads the status of a leftover VM deletion. */
export function doGet(
  params: RecipeParams,
  options: { signal?: AbortSignal } = {},
) {
  return apiDoGet<DTOs.CloudOrphanExecutionV1>(recipe(params), options);
}
