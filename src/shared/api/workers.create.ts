import { workspaceHeaders } from '@/shared/libs/api-client/config';
import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export type WorkerInput =
  | { type: 'vm'; name: string; executorId: string }
  | {
      type: 'github';
      name: string;
      repository: string;
      workflow: string;
      ref: string;
    };

export type RecipeParams = WorkerInput & { workspaceId: string };

export function recipe(params: RecipeParams): DoRequestRecipe {
  const data =
    params.type === 'vm'
      ? { name: params.name, type: 'vm', executor_id: params.executorId }
      : {
          name: params.name,
          type: 'github',
          repository: params.repository,
          workflow: params.workflow,
          ref: params.ref,
        };

  return {
    method: 'POST',
    url: '/v1/workers',
    headers: workspaceHeaders(params.workspaceId),
    data,
  };
}

// =============================================================================
//   Method
// =============================================================================

/** Adds a worker. A VM worker's token comes back once, in this response. */
export function doPost(params: RecipeParams) {
  return apiDoPost<DTOs.WorkerSecretV1>({
    ...recipe(params),
  });
}
