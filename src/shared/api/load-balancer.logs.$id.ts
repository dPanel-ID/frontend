import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  loadBalancerId: string;
  line?: number;
  limit?: number;
  timeGte?: string;
  timeLt?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { line, limit, loadBalancerId, timeGte, timeLt } = params;
  const queryParams = createQueryParams({
    line,
    limit,
    time_gte: timeGte,
    time_lt: timeLt,
  });

  return {
    url: `/v2/load-balancer/${loadBalancerId}/logs?${queryParams.toString()}`,
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.LoadBalancerLogsV2>(recipe(params), params.options);
}
