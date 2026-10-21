import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { DEFAULT_EXCLUDED_EXECUTION_TYPES } from './execution.find';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  /** Omit these execution types. Agent chatter is excluded by default. */
  excludeType?: string[];
  machineId?: string;
  module?: string;
  /** RFC3339 time, or a Go duration ago such as '24h'. Capped at 30 days. */
  since?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    excludeType = DEFAULT_EXCLUDED_EXECUTION_TYPES,
    machineId,
    module,
    since,
  } = params;

  const queryParams = createQueryParams({
    exclude_type: excludeType.length ? excludeType.join(',') : undefined,
    machine_id: machineId,
    module,
    since,
  });

  return {
    url: `/v2/executions/summary?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.ExecutionSummaryV2;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
