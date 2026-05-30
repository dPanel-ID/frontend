import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  organizationId?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { organizationId } = params;

  const queryParams = createQueryParams({
    organization_id: organizationId,
  });

  return {
    url: `/v1/organization-role/available?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  workspace_id?: string;
  group_id?: string;
  role_groups?: DTOs.OrganizationAvailableRoleGroupV1[];
  roles?: DTOs.OrganizationAvailableRoleV1[];
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
