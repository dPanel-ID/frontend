import {
  apiDoGet,
  createQueryParams,
  useApiGet,
} from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  loadBalancerId: string;
  line?: number;
  limit?: number;
  /** 1-based, newest first; keep timeGte/timeLt fixed while paging. */
  page?: number;
  timeGte?: string;
  timeLt?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const { line, limit, loadBalancerId, page, timeGte, timeLt } = params;
  const queryParams = createQueryParams({
    line,
    limit,
    page: page && page > 1 ? page : undefined,
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

/** One page outside a hook, e.g. while downloading every page. */
export function get(params: RecipeParams, options?: { signal?: AbortSignal }) {
  return apiDoGet<DTOs.LoadBalancerLogsV2>(recipe(params), options);
}
