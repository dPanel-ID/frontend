import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import useApiGetLazy from '@/shared/libs/api-client/hooks/useApiGetLazy';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

// =============================================================================
//   Recipe
// =============================================================================

export interface RecipeParams {
  serverId: string;
  file?: string;
  line?: number | string;
  limit?: number | string;
  timeGte?: string;
  timeLt?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { serverId, file, line, limit, timeGte, timeLt } = params;

  const queryParams = createQueryParams({
    file,
    line,
    limit,
    time_gte: timeGte,
    time_lt: timeLt,
  });

  return {
    url: `/v1/server/origin/${serverId}/log?${queryParams.toString()}`,
  };
}

// =============================================================================
//   Method
// =============================================================================

export type Dto = DTOs.ServerLogViewerV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}

export function useGetLazy() {
  return useApiGetLazy<Dto, RecipeParams>(recipe);
}
