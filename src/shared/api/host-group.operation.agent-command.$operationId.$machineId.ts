import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  machineId: string;
  operationId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/host-group-operations/${params.operationId}/targets/${params.machineId}/agent-command`,
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<DTOs.HostGroupOperationAgentCommandDetailV2>(
    recipe(params),
    params.options,
  );
}

export function fetchGet(params: RecipeParams) {
  return apiClient<DTOs.HostGroupOperationAgentCommandDetailV2>({
    ...recipe(params),
    method: 'GET',
  });
}
