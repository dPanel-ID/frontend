import { useApiGet } from '@/shared/libs/api-client';
import { workspaceHeaders } from '@/shared/libs/api-client/config';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** A team's group ID, or "personal". */
  workspaceId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: '/v1/workers',
    headers: workspaceHeaders(params.workspaceId),
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.WorkersConfigV1;

/** The workspace's worker mode and private workers (no secrets). */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
