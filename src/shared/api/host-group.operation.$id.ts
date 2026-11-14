import { useApiGet } from '@/shared/libs/api-client';
import { apiDoPost } from '@/shared/libs/api-client/lib/apiDoPost';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  GetRequestRecipe,
  PureResponse,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import {
  parseHostGroupActionResponsePayload,
  parseHostGroupOperationDetailResponse,
  parseHostGroupOperationPayload,
  useHostGroupOperationDetailAdapter,
} from './host-group.parsers';

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
  const [response, refresh] = useApiGet<unknown>(recipe(params), params.options);

  return [useHostGroupOperationDetailAdapter(response), refresh] as const;
}

export function fetchGet(params: DetailRecipeParams) {
  return apiClient<unknown>({
    ...recipe(params),
    method: 'GET',
  }).then(parseHostGroupOperationDetailResponse);
}

export function doPost(
  payload: SubmitPayload,
): Promise<PureResponse<ReturnType<typeof parseHostGroupActionResponsePayload>>> {
  return apiDoPost<unknown>({
    method: 'POST',
    url: `/v1/host-groups/${payload.id}/operations`,
    data: {
      action: payload.action,
      payload: payload.payload ?? {},
    },
  }).then((response) => {
    if (response.$status !== 'success') {
      return response;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupActionResponsePayload(response),
      };
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      };
    }
  });
}

export function retryPost(
  payload: RetryPayload,
): Promise<PureResponse<ReturnType<typeof parseHostGroupOperationPayload>>> {
  return apiDoPost<unknown>({
    method: 'POST',
    url: `/v1/host-group-operations/${payload.id}/retry`,
    data: {
      variables: payload.variables,
      ref: payload.ref,
    },
  }).then((response) => {
    if (response.$status !== 'success') {
      return response;
    }

    try {
      return {
        $status: 'success' as const,
        ...parseHostGroupOperationPayload(response),
      };
    } catch (error) {
      return {
        $status: 'failed' as const,
        ...processError(error),
      };
    }
  });
}
