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
  /** Only these statuses, for example ['failed', 'cancelled']. */
  status?: string[];
  /** Only these execution types. */
  type?: string[];
  /**
   * Omit these execution types. Agent chatter (`agent_rpc`, `agent_command`)
   * is noise in a user-facing feed and is excluded by default.
   */
  excludeType?: string[];
  machineId?: string;
  module?: string;
  moduleId?: string;
  /** RFC3339 time, or a Go duration ago such as '24h'. Capped at 30 days. */
  since?: string;
  limit?: number;
}

export const DEFAULT_EXCLUDED_EXECUTION_TYPES = ['agent_rpc', 'agent_command'];

export function recipe(params: RecipeParams): GetRequestRecipe {
  const {
    status,
    type,
    excludeType = DEFAULT_EXCLUDED_EXECUTION_TYPES,
    machineId,
    module,
    moduleId,
    since,
    limit = 20,
  } = params;

  const queryParams = createQueryParams({
    status: status?.length ? status.join(',') : undefined,
    type: type?.length ? type.join(',') : undefined,
    exclude_type: excludeType.length ? excludeType.join(',') : undefined,
    machine_id: machineId,
    module,
    module_id: moduleId,
    since,
    limit,
  });

  return {
    url: `/v2/executions?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.ExecutionV2[];

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
