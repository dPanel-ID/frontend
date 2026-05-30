import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {
  provider: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/cloud/project/providers/${encodeURIComponent(params.provider)}`,
  };
}

export type Dto = DTOs.CloudProviderContractV1;

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  return useApiGet<Dto>(recipe(params), params.options);
}
