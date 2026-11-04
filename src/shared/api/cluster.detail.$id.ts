import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { useClusterDetailAdapter } from './cluster.parsers';

export interface RecipeParams {
  id: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/clusters/${params.id}`,
  };
}

/** One cluster with its nodes and last execution. */
export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<unknown>(
    recipe(params),
    params.options,
  );

  return [useClusterDetailAdapter(response), refresh] as const;
}
