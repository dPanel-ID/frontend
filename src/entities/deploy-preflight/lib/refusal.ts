import type { DTOs } from '@/shared/api';
import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

/** What the API answers when pre-flight checks refuse a deployment. */
export interface PreflightRefusal {
  /** The API's message, starting with "pre-flight checks failed". */
  message: string;
  checks: DTOs.ApplicationPreflightCheckV1[];
}

const REFUSAL_PREFIX = 'pre-flight checks failed';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function toCheck(value: unknown): DTOs.ApplicationPreflightCheckV1 | null {
  if (!isRecord(value) || typeof value.code !== 'string' || !value.code) {
    return null;
  }
  const params = isRecord(value.params)
    ? Object.fromEntries(
        Object.entries(value.params).map(([key, item]) => [
          key,
          typeof item === 'string' ? item : String(item ?? ''),
        ]),
      )
    : undefined;
  return {
    code: value.code,
    level: value.level === 'error' ? 'error' : 'warning',
    message: typeof value.message === 'string' ? value.message : undefined,
    params,
  };
}

/**
 * The pre-flight refusal in a failed deploy or bootstrap response (HTTP
 * 422 with data.blocking and data.checks), or null for any other answer.
 * Errors come first, so the dialog leads with what blocks.
 */
export function getPreflightRefusal(response: {
  $status: string;
  error?: unknown;
}): PreflightRefusal | null {
  if (response.$status !== 'failed') return null;
  const { error } = response;
  if (!(error instanceof BaseResponseError)) return null;
  const message = error.rawError || error.errorMessage;
  const isRefusal =
    Number(error.code) === 422 &&
    message.toLowerCase().startsWith(REFUSAL_PREFIX);
  if (!isRefusal) return null;

  const data = isRecord(error.data) ? error.data : {};
  const checks = (Array.isArray(data.checks) ? data.checks : [])
    .map(toCheck)
    .filter((check): check is DTOs.ApplicationPreflightCheckV1 =>
      Boolean(check),
    );
  return {
    message,
    checks: [
      ...checks.filter((check) => check.level === 'error'),
      ...checks.filter((check) => check.level !== 'error'),
    ],
  };
}
