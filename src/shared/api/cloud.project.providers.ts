import { useApiGet } from '@/shared/libs/api-client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface RecipeParams {}

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/cloud/project/providers',
  };
}

export type Dto = DTOs.CloudProviderContractListV1;

export function useGet(params: WithApiGetOptions<RecipeParams> = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}
