import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

// =============================================================================
//   Recipe
// =============================================================================

export type Dto = number[];

export function recipe(): GetRequestRecipe {
  return {
    url: `/v1/secret/ssh-key/lengths`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export function useGet(params: WithApiGetOptions = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
