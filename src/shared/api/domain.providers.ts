import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export type ProviderIcon = DTOs.DomainProviderIconV1;
export type ProviderFieldOption = DTOs.DomainProviderFieldOptionV1;
export type ProviderField = DTOs.DomainProviderFieldV1;
export type ProviderRule = DTOs.DomainProviderRuleV1;
export type ProviderContract = DTOs.DomainProviderContractV1;
export type DomainPayloadExample = DTOs.DomainContractPayloadV1;
export type RecordPayloadExample = DTOs.DomainRecordPayloadV1;
export type Dto = DTOs.DomainProviderContractListV1;

export interface RecipeParams {}

export function recipe(): GetRequestRecipe {
  return {
    url: '/v1/domain/providers',
  };
}

export function useGet(params: WithApiGetOptions<RecipeParams> = {}) {
  return useApiGet<Dto>(recipe(), params.options);
}

export function fetchGet() {
  return apiClient<Dto>({
    ...recipe(),
    method: 'GET',
  });
}
