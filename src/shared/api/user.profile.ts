import { useApiGet } from '@/shared/libs/api-client';
import useApiGetLazy from '@/shared/libs/api-client/hooks/useApiGetLazy';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/user/profile',
  };
}

// =============================================================================
//   Method
// =============================================================================

export interface Dto {
  agent?: string;
  router?: string;
  user?: DTOs.User;
  github?: DTOs.Github;
  casdoor?: DTOs.ProviderData;
  organization?: DTOs.OrganizationV1;
  active_workspace?: string;
  workspaces?: Array<{
    id: string;
    type: string;
    name: string;
    local_organization_id?: string;
    roles?: string[];
  }>;
}

export function useGet(params?: WithApiGetOptions) {
  return useApiGet<Dto>(recipe(), params?.options);
}

export function useGetLazy() {
  return useApiGetLazy<Dto, unknown>(recipe);
}
