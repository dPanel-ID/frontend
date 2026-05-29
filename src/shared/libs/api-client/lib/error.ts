import { isAxiosError } from 'axios';

import type { BaseResponse, ExecutionErrorDetail } from '../rules/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function getStringField(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function compactText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function formatExecutionErrorDetail(detail: ExecutionErrorDetail) {
  const record = detail as Record<string, unknown>;
  const primary =
    getStringField(record, 'summary') ??
    getStringField(record, 'message') ??
    getStringField(record, 'detail');

  const lines: string[] = [];
  if (primary) lines.push(compactText(primary));

  const metadataFields = [
    'type',
    'event_type',
    'action',
    'module',
    'role',
    'play',
    'task',
    'host',
    'machine_id',
    'execution_id',
    'exit_code',
  ] as const;

  for (const field of metadataFields) {
    const value = record[field];
    if (value == null || value === '') continue;
    lines.push(`${field}: ${String(value)}`);
  }

  return lines.join('\n');
}

function formatErrorDetailValue(value: unknown) {
  if (typeof value === 'string' && value.trim()) return compactText(value);
  if (!isRecord(value)) return undefined;

  const formattedDetail = formatExecutionErrorDetail(value);
  return formattedDetail || undefined;
}

export function getBackendErrorDetail(payload: unknown) {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (!isRecord(payload)) return undefined;

  const errorDetail = payload.error_detail ?? payload.errorDetail;
  const formattedErrorDetail = formatErrorDetailValue(errorDetail);
  if (formattedErrorDetail) return formattedErrorDetail;

  return getStringField(payload, 'error') ?? getStringField(payload, 'message');
}

export function getApiErrorDetail(error: unknown) {
  if (error instanceof BaseResponseError) {
    return error.errorMessage || error.message;
  }

  if (isAxiosError(error)) {
    return getBackendErrorDetail(error.response?.data) ?? error.message;
  }

  return error instanceof Error ? error.message : String(error);
}

export function normalizeApiError(error: unknown) {
  if (error instanceof BaseResponseError) return error;
  if (!isAxiosError(error)) return error;

  const payload = error.response?.data;
  if (!isRecord(payload)) return error;

  const status = getStringField(payload, 'status') ?? 'failed';
  const rawCode = payload.code ?? error.response?.status ?? error.status;
  const code = Number(rawCode) || 0;
  const rawError =
    getStringField(payload, 'error') ??
    getStringField(payload, 'message') ??
    error.message;
  const rawErrorDetail = payload.error_detail ?? payload.errorDetail;

  return new BaseResponseError({
    code,
    data: payload.data,
    error: rawError,
    error_detail: isRecord(rawErrorDetail) ? rawErrorDetail : null,
    status,
  });
}

export class BaseResponseError extends Error {
  public errorMessage: string;
  public errorDetail?: ExecutionErrorDetail | null;
  public rawError: string;
  public code: number;
  public status: string;
  public data?: unknown;

  constructor(option: BaseResponse<unknown>) {
    const errorDetail = option.error_detail;
    const formattedErrorDetail = formatErrorDetailValue(errorDetail) ?? '';
    const rawError =
      typeof option.error === 'string'
        ? option.error.trim()
        : (formatErrorDetailValue(option.error) ?? '');
    const displayError = formattedErrorDetail || rawError || 'Unknown error';
    const fallbackErrorMessage =
      `<< Response Error - HTTP ${option.code} >>\n` +
      `   (Status: ${option.status}) ${displayError}`;

    super(fallbackErrorMessage);

    this.code = option.code;
    this.status = option.status;
    this.data = option.data;
    this.rawError = rawError;
    this.errorDetail = errorDetail;
    this.errorMessage = displayError;
  }
}

export class AdapterError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    const errorMessages = errors.map((error) => `- ${error}`);
    const fallbackErrorMessage =
      '<< Adapter Error >>\n' + errorMessages.join('\n');

    super(fallbackErrorMessage);

    this.errors = errors;
  }

  getErrors(): string[] {
    return this.errors;
  }
}
