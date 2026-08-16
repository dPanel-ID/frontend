import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  commandType?: string;
  executionId?: string;
  limit?: number;
  machineId?: string;
  status?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const queryParams = createQueryParams({
    command_type: params.commandType,
    execution_id: params.executionId,
    limit: params.limit ?? 100,
    machine_id: params.machineId,
    status: params.status,
  });

  return {
    url: `/v2/agents/commands?${queryParams.toString()}`,
  };
}

export type Dto = DTOs.AgentCommandV2[];

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
