import type { DoRequestRecipe } from '@/shared/libs/api-client/rules/types';

import { apiDoPost } from '../libs/api-client';

// =============================================================================
//   Recipe
// =============================================================================

export type ResourceType =
  | 'server'
  | 'application'
  | 'domain'
  | 'load-balancer'
  | 'cloud-project'
  | 'ssh-key';

export interface RecipeParams {
  resourceType: ResourceType;
  resourceId: string;
  /** "personal" or a Casdoor workspace group ID. */
  target: string;
  /** Also move the resources this one needs, such as a server's SSH key. */
  includeDependencies?: boolean;
}

export function recipe(params: RecipeParams): DoRequestRecipe {
  return {
    method: 'POST',
    url: '/v1/ownership/transfer',
    data: {
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      target: params.target,
      include_dependencies: Boolean(params.includeDependencies),
    },
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  workspace_type: string;
  workspace_id: string;
  moved: Array<{
    resource_type: ResourceType;
    resource_id: string;
    name?: string;
    workspace_type: string;
    workspace_id: string;
  }>;
}

export function doPost(params: RecipeParams) {
  return apiDoPost<Dto>({
    ...recipe(params),
  });
}
