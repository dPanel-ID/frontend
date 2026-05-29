import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  appDefinition?: Record<string, unknown>;
  applicationId: string;
  workerId: string;
  fromBranch: string;
  buildArtifact?: boolean;
  isPrimary?: boolean;
  commit: {
    message: string;
    sha: string;
  };
  appConfigFile: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const {
    appDefinition,
    applicationId,
    workerId,
    fromBranch,
    commit,
    appConfigFile,
  } = params;

  return {
    method: 'POST',
    url: `/v1/artifact/create`,
    data: {
      app_definition: appDefinition,
      application_id: Number(applicationId),
      machine_id: Number(workerId),
      branch: fromBranch,
      build_artifact: params.buildArtifact ?? false,
      description: commit.message,
      git_host: 'github',
      head: commit.sha,
      is_primary: params.isPrimary,
      meta_file: appConfigFile === 'default' ? '' : appConfigFile,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.ArtifactV1>({
    ...recipe(params),
  });
}
