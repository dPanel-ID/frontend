import { schemaHostGroupOperationAgentCommandDetailV2 } from '@/shared/api/-dtos/agent-command';
import useAdapter from '@/shared/libs/api-client/hooks/useAdapter';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  ApiClientResponse,
  Response,
} from '@/shared/libs/api-client/rules/types';
import {
  schemaHostGroupActionResponseDto,
  schemaHostGroupDeploymentActionResponseDto,
  schemaHostGroupDetailDto,
  schemaHostGroupModuleActionResponseDto,
  schemaHostGroupOperationDetailDto,
  schemaHostGroupOperationDto,
  schemaHostGroupSummaryDto,
} from '@/shared/rules/host-group';

function stripResponseMetadata(value: unknown) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
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
    return response;
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

function useParsedResponse<Data>(
  response: Response<unknown>,
  parse: (value: unknown) => Data,
) {
  return useAdapter(response, (value) => parse(stripResponseMetadata(value)));
}

export function parseHostGroupListPayload(value: unknown) {
  return schemaHostGroupSummaryDto.array().parse(stripResponseMetadata(value));
}

export function parseHostGroupDetailPayload(value: unknown) {
  return schemaHostGroupDetailDto.parse(stripResponseMetadata(value));
}

export function parseHostGroupSummaryPayload(value: unknown) {
  return schemaHostGroupSummaryDto.parse(stripResponseMetadata(value));
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

export function parseHostGroupModuleActionResponsePayload(value: unknown) {
  return schemaHostGroupModuleActionResponseDto.parse(
    stripResponseMetadata(value),
  );
}

export function parseHostGroupDeploymentActionResponsePayload(value: unknown) {
  return schemaHostGroupDeploymentActionResponseDto.parse(
    stripResponseMetadata(value),
  );
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

export function parseHostGroupSummaryResponse(
  response: ApiClientResponse<unknown>,
) {
  return adaptSuccessResponse(response, parseHostGroupSummaryPayload);
}

export function useHostGroupListAdapter(response: Response<unknown>) {
  return useParsedResponse(response, parseHostGroupListPayload);
}

export function useHostGroupDetailAdapter(response: Response<unknown>) {
  return useParsedResponse(response, parseHostGroupDetailPayload);
}

export function useHostGroupOperationDetailAdapter(response: Response<unknown>) {
  return useParsedResponse(response, parseHostGroupOperationDetailPayload);
}

export function useHostGroupOperationHistoryAdapter(
  response: Response<unknown>,
) {
  return useParsedResponse(response, parseHostGroupOperationHistoryPayload);
}

export function useHostGroupAgentCommandAdapter(response: Response<unknown>) {
  return useParsedResponse(response, parseHostGroupAgentCommandPayload);
}
