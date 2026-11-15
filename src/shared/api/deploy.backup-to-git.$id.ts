import type {
  DoRequestRecipe,
  GetRequestRecipe,
} from '@/shared/libs/api-client/rules/types';

import { apiDoGet, apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  deploymentId: string;
}

export interface PostParams extends RecipeParams {
  branch: string;
  /** Required for a branch the application deploys from. */
  confirmDeployBranch: boolean;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/deploy/${encodeURIComponent(params.deploymentId)}/backup-to-git`,
  };
}

export function postRecipe(params: PostParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: `/v1/deploy/${encodeURIComponent(params.deploymentId)}/backup-to-git`,
    data: {
      branch: params.branch,
      confirm_deploy_branch: params.confirmDeployBranch,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

/** The suggested branch, the deploy branches and whether one is running. */
export function doGet(
  params: RecipeParams,
  options: { signal?: AbortSignal } = {},
) {
  return apiDoGet<DTOs.GitBackupOptionsV1>(recipe(params), options);
}

/** Queues a backup of the deployment's files to a branch. */
export function doPost(params: PostParams) {
  return apiDoPost<DTOs.GitBackupStartV1>(postRecipe(params));
}
