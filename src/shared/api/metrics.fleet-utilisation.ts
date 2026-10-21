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
  /** RFC3339 time, or a Go duration ago such as '24h'. Capped at 30 days. */
  since?: string;
  /**
   * Bucket width. Left unset the API picks the widest that stays readable:
   * hourly up to three days, daily beyond.
   */
  bucket?: 'hour' | 'day';
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { since, bucket } = params;

  const queryParams = createQueryParams({ since, bucket });

  return {
    url: `/v2/metrics/fleet-utilisation?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.FleetUtilisationV2;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
