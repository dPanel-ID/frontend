import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { useHostGroupListAdapter } from './host-group.parsers';

export interface RecipeParams {
  page?: number;
  limit?: number;
}

export function recipe(_params: RecipeParams = {}): GetRequestRecipe {
  return {
    url: '/v1/host-groups',
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<unknown>(recipe(params), params.options);

  return [useHostGroupListAdapter(response), refresh] as const;
}
