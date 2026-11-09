import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { serviceAccountsUrl } from './service-accounts.url';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** A team's group ID, or "personal" for the caller's own accounts. */
  workspaceId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return { url: serviceAccountsUrl(params.workspaceId) };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.ServiceAccountListV1;

/** Service accounts and their tokens, never a token's secret. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
