import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  artifactId: string;
  workerId: string;
  noDeploy?: boolean;
  isPrimary?: boolean;
  bootstrap?: boolean;
  applicationPhase?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const {
    applicationId,
    artifactId,
    workerId,
    isPrimary,
    noDeploy,
    bootstrap,
    applicationPhase,
  } = params;

  return {
    method: 'POST',
    url: `/v1/deploy/create`,
    data: {
      application_id: Number(applicationId),
      machine_id: Number(workerId),
      artifact_id: Number(artifactId),
      application_phase: applicationPhase,
      bootstrap,
      no_deploy: noDeploy,
      is_primary: isPrimary,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.DeployV1>({
    ...recipe(params),
  });
}
