import { isAxiosError } from 'axios';
import type { Locale } from 'use-intl';

import type { DTOs } from '@/shared/api';
import { BaseResponseError } from '@/shared/libs/api-client/lib/error';
import type { ResponseError } from '@/shared/libs/api-client/rules/types';
import { getDistanceFromNow } from '@/shared/libs/browser/date';

import type {
  WorkerKind,
  WorkerRow,
  WorkerSecretResult,
  WorkersMode,
  WorkersView,
} from '../rules/types';

/** The executor reads these first; the rest follow in name order. */
const ENV_KEY_ORDER = [
  'DPANEL_EXECUTOR_TOKEN',
  'DPANEL_EXECUTOR_WORKSPACE_ID',
  'DPANEL_EXECUTOR_MANAGER_URL',
];

function text(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Anything but "private" is shared, which is also the default. */
export function normalizeMode(value: string | null | undefined): WorkersMode {
  return value?.trim().toLowerCase() === 'private' ? 'private' : 'shared';
}

export function normalizeWorkerKind(
  value: string | null | undefined,
): WorkerKind {
  const kind = value?.trim().toLowerCase();
  return kind === 'vm' || kind === 'github' ? kind : 'unknown';
}

/** Executor ID for a VM worker, "owner/repo · workflow@ref" for GitHub. */
export function describeWorkerTarget(worker: DTOs.WorkerV1): string | null {
  const kind = normalizeWorkerKind(worker.type);

  if (kind === 'github') {
    const repository = text(worker.repository);
    if (!repository) return null;

    const workflow = text(worker.workflow);
    const ref = text(worker.ref);
    if (!workflow) return repository;

    return `${repository} · ${workflow}${ref ? `@${ref}` : ''}`;
  }

  return text(worker.executor_id);
}

export function toWorkerRow(worker: DTOs.WorkerV1): WorkerRow {
  return {
    id: worker.id,
    name: text(worker.name) ?? worker.id,
    kind: normalizeWorkerKind(worker.type),
    target: describeWorkerTarget(worker),
    tokenHint: text(worker.token_hint),
    createdAt: text(worker.created_at),
    lastSeenAt: text(worker.last_seen_at),
  };
}

export function toWorkersView(dto: DTOs.WorkersConfigV1): WorkersView {
  return {
    mode: normalizeMode(dto.mode),
    scopeType: dto.scope?.type === 'group' ? 'group' : 'personal',
    workspaceHeader: text(dto.workspace_header) ?? '',
    managerUrl: text(dto.manager_url) ?? '',
    workers: (dto.workers ?? []).filter((w) => Boolean(w.id)).map(toWorkerRow),
  };
}

/** Quotes a value only when a shell or .env parser would split it. */
function envValue(value: string) {
  if (/^[A-Za-z0-9_./:@%+,=-]*$/.test(value)) return value;
  return `"${value.replace(/(["\\$`])/g, '\\$1')}"`;
}

/** KEY=value lines for an environment file, known keys first. */
export function formatEnvBlock(
  env: Record<string, string> | null | undefined,
): string {
  if (!env) return '';

  const keys = Object.keys(env).filter((key) => key.trim());
  const known = ENV_KEY_ORDER.filter((key) => keys.includes(key));
  const rest = keys.filter((key) => !ENV_KEY_ORDER.includes(key)).sort();

  return [...known, ...rest]
    .map((key) => `${key}=${envValue(env[key] ?? '')}`)
    .join('\n');
}

export function toWorkerSecretResult(
  dto: DTOs.WorkerSecretV1,
): WorkerSecretResult {
  return {
    worker: toWorkerRow(dto.worker),
    token: text(dto.token),
    envBlock: formatEnvBlock(dto.env) || null,
    workflowYaml: dto.workflow_yaml?.trim() ? dto.workflow_yaml : null,
  };
}

const REPOSITORY_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

/**
 * "owner/name" from what people paste: the slug itself, a github.com URL
 * or an SSH clone address. Null when it is not a GitHub repository.
 */
export function parseRepository(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const isAddress = /github\.com[/:]/i.test(raw);
  const path = raw
    .replace(/^git@github\.com:/i, '')
    .replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');

  const segments = path.split('/');
  // A link to a page inside the repository still names the repository; a
  // bare value must be exactly "owner/name".
  if (segments.length < 2 || (!isAddress && segments.length !== 2)) {
    return null;
  }

  const [owner = '', rawName = ''] = segments;
  const name = rawName.replace(/\.git$/i, '');
  if (name === '.' || name === '..') return null;

  const slug = `${owner}/${name}`;
  return REPOSITORY_PATTERN.test(slug) ? slug : null;
}

/** "3 minutes ago", or null when the worker has not been seen. */
export function formatLastSeen(
  value: string | null | undefined,
  locale: Locale,
): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return null;

  return getDistanceFromNow(date, locale);
}

/** The HTTP status of a failed request, when the API gave one. */
export function responseErrorCode(response: ResponseError): number | undefined {
  if (response.kind !== 'api') return undefined;

  const { error } = response;
  if (error instanceof BaseResponseError) return error.code;
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

/**
 * True when the card should not render at all: the API does not offer
 * workers yet (404) or the viewer may not read this workspace (401/403).
 */
export function isWorkersUnavailable(response: ResponseError): boolean {
  const code = responseErrorCode(response);
  return code === 404 || code === 401 || code === 403;
}
