import type { Response } from '@/shared/libs/api-client/rules/types';

/**
 * HTTP status carried by a failed response, when the failure came from the
 * API at all. Adapter and runtime errors have no status and return undefined.
 */
export function responseStatusCode(
  response: Response<unknown>,
): number | undefined {
  if (response.$status !== 'failed') return undefined;
  return errorStatusCode(response.error);
}

/**
 * True when the backend refused the request rather than failing it. The panel
 * then explains the missing permission instead of offering a retry that
 * cannot succeed.
 */
export function isUnauthorizedResponse(response: Response<unknown>) {
  const code = responseStatusCode(response);
  return code === 401 || code === 403;
}

function errorStatusCode(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  // BaseResponseError carries the backend code; an AxiosError carries the
  // transport status, on the response for a reply and on itself otherwise.
  const candidates = [
    error.code,
    isRecord(error.response) ? error.response.status : undefined,
    error.status,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'number') continue;
    if (!Number.isFinite(candidate) || candidate <= 0) continue;
    return candidate;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
