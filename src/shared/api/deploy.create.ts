import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import type { ExplicitTarget } from '@/shared/rules/host-group';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  applicationId: string;
  artifactId: string;
  workerId: string;
  target?: ExplicitTarget;
  noDeploy?: boolean;
  isPrimary?: boolean;
  bootstrap?: boolean;
  applicationPhase?: string;
}

export type DeployCreateResponse =
  | DTOs.DeployV1
  | DTOs.HostGroupActionResponseV1;

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
      machine_id: workerId ? Number(workerId) : undefined,
      artifact_id: Number(artifactId),
      application_phase: applicationPhase,
      bootstrap,
      no_deploy: noDeploy,
      is_primary: isPrimary,
      target: workerId ? undefined : params.target,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doPost(params: RecipeParams) {
  return apiDoPost<DeployCreateResponse>({
    ...recipe(params),
  });
}
