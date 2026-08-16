import useAdapter from '@/shared/libs/api-client/hooks/useAdapter';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  ApiClientResponse,
  Response,
} from '@/shared/libs/api-client/rules/types';
import { schemaHostGroupOperationAgentCommandDetailV2 } from '@/shared/api/-dtos/agent-command';
import {
  schemaHostGroupActionResponseDto,
  schemaHostGroupDto,
  schemaHostGroupOperationDetailDto,
  schemaHostGroupOperationDto,
} from '@/shared/rules/host-group';

function stripResponseMetadata(value: unknown) {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  const {
    $status: _status,
    $statusCode: _statusCode,
    ...payload
  } = value as Record<string, unknown>;

  return payload;
}

function adaptSuccessResponse<Data>(
  response: ApiClientResponse<unknown>,
  parse: (value: unknown) => Data,
): ApiClientResponse<Data> {
  if (response.$status !== 'success') {
    return response as ApiClientResponse<Data>;
  }

  try {
    return {
      $status: 'success',
      $statusCode: response.$statusCode,
      ...parse(response),
    };
  } catch (error) {
    return {
      $status: 'failed',
      $statusCode: response.$statusCode,
      ...processError(error),
    };
  }
}

function adaptResponse<Data>(
  response: Response<unknown>,
  parse: (value: unknown) => Data,
) {
  return useAdapter(response, (value) => parse(stripResponseMetadata(value)));
}

export function parseHostGroupListPayload(value: unknown) {
  return schemaHostGroupDto.array().parse(stripResponseMetadata(value));
}

export function parseHostGroupDetailPayload(value: unknown) {
  return schemaHostGroupDto.parse(stripResponseMetadata(value));
}

export function parseHostGroupOperationDetailPayload(value: unknown) {
  return schemaHostGroupOperationDetailDto.parse(stripResponseMetadata(value));
}

export function parseHostGroupOperationHistoryPayload(value: unknown) {
  return schemaHostGroupOperationDto.array().parse(stripResponseMetadata(value));
}

export function parseHostGroupActionResponsePayload(value: unknown) {
  return schemaHostGroupActionResponseDto.parse(stripResponseMetadata(value));
}

export function parseHostGroupOperationPayload(value: unknown) {
  return schemaHostGroupOperationDto.parse(stripResponseMetadata(value));
}

export function parseHostGroupAgentCommandPayload(value: unknown) {
  return schemaHostGroupOperationAgentCommandDetailV2.parse(
    stripResponseMetadata(value),
  );
}

export function parseHostGroupListResponse(response: ApiClientResponse<unknown>) {
  return adaptSuccessResponse(response, parseHostGroupListPayload);
}

export function parseHostGroupDetailResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupDetailPayload);
}

export function parseHostGroupOperationDetailResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupOperationDetailPayload);
}

export function parseHostGroupOperationHistoryResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupOperationHistoryPayload);
}

export function parseHostGroupActionResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupActionResponsePayload);
}

export function parseHostGroupOperationResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupOperationPayload);
}

export function parseHostGroupAgentCommandResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupAgentCommandPayload);
}

export function useHostGroupListAdapter(response: Response<unknown>) {
  return adaptResponse(response, parseHostGroupListPayload);
}

export function useHostGroupDetailAdapter(response: Response<unknown>) {
  return adaptResponse(response, parseHostGroupDetailPayload);
}

export function useHostGroupOperationDetailAdapter(response: Response<unknown>) {
  return adaptResponse(response, parseHostGroupOperationDetailPayload);
}

export function useHostGroupOperationHistoryAdapter(
  response: Response<unknown>,
) {
  return adaptResponse(response, parseHostGroupOperationHistoryPayload);
}

export function useHostGroupAgentCommandAdapter(response: Response<unknown>) {
  return adaptResponse(response, parseHostGroupAgentCommandPayload);
}
