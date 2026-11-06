import { isAxiosError } from 'axios';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';
import type { ResponseError } from '@/shared/libs/api-client/rules/types';

/**
 * True when the API refused the request because the account is not allowed
 * (401 or 403), so the page shows the unauthorized state instead of a retry.
 */
export function isAccessDenied(response: ResponseError): boolean {
  if (response.kind !== 'api') return false;

  const { error } = response;
  const code =
    error instanceof BaseResponseError
      ? error.code
      : isAxiosError(error)
        ? error.response?.status
        : undefined;

  return code === 401 || code === 403;
}
