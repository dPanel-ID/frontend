import useAdapter from '@/shared/libs/api-client/hooks/useAdapter';
import { processError } from '@/shared/libs/api-client/lib/processor';
import type {
  PureResponse,
  Response,
} from '@/shared/libs/api-client/rules/types';
import {
  schemaClusterDetailDto,
  schemaClusterKindsResponseDto,
  schemaClusterListResponseDto,
  schemaClusterMutationResponseDto,
} from '@/shared/rules/cluster';

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

export function parseClusterKindsPayload(value: unknown) {
  return schemaClusterKindsResponseDto.parse(stripResponseMetadata(value));
}

export function parseClusterListPayload(value: unknown) {
  return schemaClusterListResponseDto.parse(stripResponseMetadata(value));
}

export function parseClusterDetailPayload(value: unknown) {
  return schemaClusterDetailDto.parse(stripResponseMetadata(value));
}

export function parseClusterMutationPayload(value: unknown) {
  return schemaClusterMutationResponseDto.parse(stripResponseMetadata(value));
}

/** Parses a successful mutation answer; a failed one passes through. */
export function adaptMutationResponse<Data>(
  response: PureResponse<unknown>,
  parse: (value: unknown) => Data,
) {
  if (response.$status !== 'success') return response;

  try {
    return { $status: 'success' as const, ...parse(response) };
  } catch (error) {
    return { $status: 'failed' as const, ...processError(error) };
  }
}

export function useClusterKindsAdapter(response: Response<unknown>) {
  return useAdapter(response, parseClusterKindsPayload);
}

export function useClusterListAdapter(response: Response<unknown>) {
  return useAdapter(response, parseClusterListPayload);
}

export function useClusterDetailAdapter(response: Response<unknown>) {
  return useAdapter(response, parseClusterDetailPayload);
}
