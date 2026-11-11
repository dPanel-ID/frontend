import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  cloudProjectId: string;
  instanceId: string;
  name: string;
  /** The VM's zone on GCP, its region elsewhere. */
  region: string;
  /** Repeats the VM name, or its ID when it has no name. */
  confirm: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { cloudProjectId, confirm, instanceId, name, region } = params;

  return {
    method: 'POST',
    url: `/v1/cloud/project/detail/${encodeURIComponent(cloudProjectId)}/orphans/delete`,
    data: {
      instance_id: instanceId,
      name,
      region,
      confirm,
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Queues deletion of one leftover VM; follow the returned execution. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.CloudOrphanDeleteResultV1>(recipe(params));
}
