import type { SchemaCommon } from '../rules/schema';

type ErrorDetail = SchemaCommon.ExecutionErrorDetail | null | undefined;

/** The state of a resource whose last execution can fail. */
export interface ExecutionErrorState {
  message?: string;
  errorDetail?: ErrorDetail;
}

/** The first useful line of a failed execution's error, for a banner. */
export function getExecutionErrorSummary(state: ExecutionErrorState) {
  const rows = getErrorDetailRows(state.errorDetail, state.message);
  return rows[0]?.value || state.message;
}

/** Error detail as labeled rows, most useful first, secrets redacted. */
export function getErrorDetailRows(
  detail: ErrorDetail,
  fallbackMessage?: string,
) {
  const rows: Array<{ key: string; value: string }> = [];
  const detailRecord = isPlainRecord(detail) ? detail : undefined;

  if (detailRecord) {
    const orderedKeys = [
      'summary',
      'message',
      'detail',
      'type',
      'event_type',
      'action',
      'module',
      'role',
      'playbook',
      'play',
      'task',
      'task_path',
      'host',
      'machine_id',
      'execution_id',
      'exit_code',
      'command',
      'stderr',
      'stdout',
      'traceparent',
    ];
    const orderedKeySet = new Set(orderedKeys);

    for (const key of orderedKeys) {
      const value = formatErrorValue(detailRecord[key], key);
      if (!value) continue;
      rows.push({ key, value });
    }

    for (const [key, rawValue] of Object.entries(detailRecord)) {
      if (orderedKeySet.has(key)) continue;
      const value = formatErrorValue(rawValue, key);
      if (!value) continue;
      rows.push({ key, value });
    }
  }

  if (rows.length === 0) {
    const value = formatErrorValue(fallbackMessage, 'error');
    if (value) rows.push({ key: 'error', value });
  }

  return rows;
}

export function formatErrorLabel(key: string) {
  return key.replaceAll('_', ' ');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isSensitiveKey(key: string) {
  return /password|passwd|secret|credential|authorization|api_?key|private_?key|access_?token|refresh_?token/i.test(
    key,
  );
}

function redactString(value: string) {
  return value
    .replace(
      /((?:password|passwd|secret|credential|authorization|api[_-]?key|private[_-]?key|access[_-]?token|refresh[_-]?token)\s*[:=]\s*)(["']?)[^"',\s;}]+/gi,
      '$1$2[redacted]',
    )
    .replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi, '$1[redacted]');
}

function sanitizeErrorValue(value: unknown, key = ''): unknown {
  if (value == null) return value;
  if (isSensitiveKey(key)) return '[redacted]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeErrorValue(item));
  }
  if (isPlainRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitizeErrorValue(childValue, childKey),
      ]),
    );
  }
  return value;
}

function formatErrorValue(value: unknown, key = '') {
  if (value == null || value === '') return undefined;

  const sanitizedValue = sanitizeErrorValue(value, key);
  const text =
    typeof sanitizedValue === 'string'
      ? sanitizedValue
      : typeof sanitizedValue === 'number' ||
          typeof sanitizedValue === 'boolean'
        ? String(sanitizedValue)
        : JSON.stringify(sanitizedValue, null, 2);
  const trimmedText = text.trim();
  if (!trimmedText || trimmedText === '{}' || trimmedText === '[]') {
    return undefined;
  }

  const maxLength = 4000;
  if (trimmedText.length <= maxLength) return trimmedText;
  return `${trimmedText.slice(0, maxLength)}\n\n... truncated`;
}
