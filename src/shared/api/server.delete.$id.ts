import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  id: string;
  /** Remove an unreachable server and its records from dPanel only. */
  forget?: boolean;
  /** With forget, for a provider dPanel cannot ask: the owner deleted the VM. */
  vmDeleted?: boolean;
}

/** What a forgotten server took with it. */
export interface ForgottenDto {
  stopped_jobs?: number;
  load_balancers?: number;
  application_deployments?: number;
  application_artifacts?: number;
  module_records?: number;
}

export interface Dto {
  agent_uninstalling?: boolean;
  deletion_phase?:
    | 'agent_uninstall'
    | 'origin_delete'
    | 'permanent'
    | 'forget'
    | string;
  forgotten?: ForgottenDto;
  execution_id?: string;
  machine_id?: string;
  origin_deleting?: boolean;
  origin_provider?: string;
  permanent_deleted?: boolean;
  status?: string;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  const { id, forget, vmDeleted } = params;
  const query = forget
    ? `?forget=true${vmDeleted ? '&vm_deleted=true' : ''}`
    : '';

  return {
    method: 'DELETE',
    url: `/v1/server/delete/${id}${query}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function doDelete(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
