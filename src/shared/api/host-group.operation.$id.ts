import { useApiGet } from '@/shared/libs/api-client';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import type {
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import type { DTOs } from '.';

export interface DetailRecipeParams {
  id: string;
}

export interface SubmitPayload {
  id: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface RetryPayload {
  id: string;
  variables?: Record<string, unknown>;
  ref?: {
    type?: string;
    name?: string;
    expected_commit?: string;
  };
}

export function recipe(params: DetailRecipeParams): GetRequestRecipe {
  return {
    url: `/v1/host-group-operations/${params.id}`,
  };
}

export function useGet(params: WithApiGetOptions<DetailRecipeParams>) {
  return useApiGet<DTOs.HostGroupOperationDetailV1>(
    recipe(params),
    params.options,
  );
}

export function fetchGet(params: DetailRecipeParams) {
  return apiClient<DTOs.HostGroupOperationDetailV1>({
    ...recipe(params),
    method: 'GET',
  });
}

export function doPost(payload: SubmitPayload) {
  return apiDoPost<DTOs.HostGroupActionResponseV1>({
    method: 'POST',
    url: `/v1/host-groups/${payload.id}/operations`,
    data: {
      action: payload.action,
      payload: payload.payload ?? {},
    },
  });
}

export function retryPost(payload: RetryPayload) {
  return apiDoPost<DTOs.HostGroupOperationV1>({
    method: 'POST',
    url: `/v1/host-group-operations/${payload.id}/retry`,
    data: {
      variables: payload.variables,
      ref: payload.ref,
    },
  });
}
