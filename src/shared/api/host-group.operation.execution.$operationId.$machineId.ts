import { useApiGet } from '@/shared/libs/api-client';
import useAdapter from '@/shared/libs/api-client/hooks/useAdapter';
import { apiClient } from '@/shared/libs/api-client/lib/client';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  ApiClientResponse,
  GetRequestRecipe,
  WithApiGetOptions,
} from '@/shared/libs/api-client/rules/types';

import { schemaHostGroupOperationExecutionDetailV1 } from './-dtos/host-group-operation-execution';

import type { DTOs } from '.';

export interface RecipeParams {
  machineId: string;
  operationId: string;
}

export function recipe(params: RecipeParams): GetRequestRecipe {
  return {
    url: `/v1/host-group-operations/${params.operationId}/targets/${params.machineId}/execution`,
  };
}

function parseScopedExecutionDetailPayload(value: unknown) {
  if (value == null || typeof value !== 'object') {
    return schemaHostGroupOperationExecutionDetailV1.parse(value);
  }

  const {
    $status: _status,
    $statusCode: _statusCode,
    ...payload
  } = value as Record<string, unknown>;

  return schemaHostGroupOperationExecutionDetailV1.parse(payload);
}

function parseScopedExecutionDetailResponse(
  response: ApiClientResponse<unknown>,
): ApiClientResponse<DTOs.HostGroupOperationExecutionDetailV1> {
  if (response.$status !== 'success') {
    return response as ApiClientResponse<DTOs.HostGroupOperationExecutionDetailV1>;
  }

  try {
    return {
      $status: 'success',
      $statusCode: response.$statusCode,
      ...parseScopedExecutionDetailPayload(response),
    };
  } catch (error) {
    return {
      $status: 'failed',
      $statusCode: response.$statusCode,
      ...processError(error),
    };
  }
}

export function useGet(params: WithApiGetOptions<RecipeParams>) {
  const [response, refresh] = useApiGet<unknown>(
    recipe(params),
    params.options,
  );

  return [
    useAdapter(response, parseScopedExecutionDetailPayload),
    refresh,
  ] as const;
}

export function fetchGet(params: RecipeParams) {
  return apiClient<unknown>({
    ...recipe(params),
    method: 'GET',
  }).then(parseScopedExecutionDetailResponse);
}
