import type { DTOs } from '@/shared/api';
import type { Response as ApiResponse } from '@/shared/libs/api-client/rules/types';

export function responseData<T>(response: ApiResponse<T>): T | undefined {
  if (response.$status === 'success') return response;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}

export function countFromPagination(
  data: { pagination?: DTOs.Pagination } | undefined,
  fallback?: number,
) {
  return data?.pagination?.total_item ?? fallback;
}

export function isPendingResponse(response: ApiResponse<unknown>) {
  return response.$status === 'initial' || response.$status === 'loading';
}
