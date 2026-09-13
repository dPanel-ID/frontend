import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import {
  parseHostGroupOperationHistoryResponse,
  useHostGroupOperationHistoryAdapter,
} from './host-group.parsers';

export interface RecipeParams {
  id: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/host-groups/${params.id}/operations`,
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<unknown>(recipe(params), params.options);

  return [useHostGroupOperationHistoryAdapter(response), refresh] as const;
}

export function fetchGet(params: RecipeParams) {
  return apiClient<unknown>({
    ...recipe(params),
    method: 'GET',
  }).then(parseHostGroupOperationHistoryResponse);
}
