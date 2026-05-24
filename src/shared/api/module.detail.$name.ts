import { createQueryParams, useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  name: string;
  ref?: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  const queryParams = createQueryParams({
    ref: params.ref,
  });

  return {
    url: `/v1/modules/${params.name}?${queryParams.toString()}`,
  };
}

export type Dto = DTOs.ModuleCatalogDetailV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
