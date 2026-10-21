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

/**
 * Whether a request finished without producing data. A count that will never
 * arrive has to be shown as unknown: left as pending it renders a loading
 * placeholder that spins for the life of the page.
 */
export function hasFailedResponse(response: ApiResponse<unknown>) {
  return response.$status === 'failed';
}
