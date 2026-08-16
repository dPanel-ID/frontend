import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import {
  parseHostGroupAgentCommandResponse,
  useHostGroupAgentCommandAdapter,
} from './host-group.parsers';

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
  const [response, refresh] = useApiGet<unknown>(recipe(params), params.options);

  return [useHostGroupAgentCommandAdapter(response), refresh] as const;
}

export function fetchGet(params: RecipeParams) {
  return apiClient<unknown>({
    ...recipe(params),
    method: 'GET',
  }).then(parseHostGroupAgentCommandResponse);
}
