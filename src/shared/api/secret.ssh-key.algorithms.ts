import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type * as DTOs from './-dtos/secret';

// =============================================================================
//   Recipe
// =============================================================================

export type Dto = DTOs.SshKeyAlgorithmsV1;

export function recipe(): GetRequestRecipe {
  return {
    url: `/v1/secret/ssh-key/algorithms`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
