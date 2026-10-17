import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  AlertCircleIcon,
  BracesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileSearchIcon,
  FileTextIcon,
  InboxIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SearchIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import { ApiFolder, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import type { ResponseError } from '@/shared/libs/api-client/rules/types';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import {
  SERVER_LOG_DISCOVERY_DIRECTORIES,
  SERVER_LOG_DISCOVERY_PATHS,
  VM_LOG_SOURCES,
  VM_LOG_SOURCE_CATEGORIES,
  buildServerLogSourcesFromDiscovery,
} from '../rules/log-sources';
import type { ServerLogSource } from '../rules/log-sources';
import type { ServerLogViewerSidepanelProps as Props } from '../rules/types';

const DEFAULT_LINE_COUNT = 100;
const DEFAULT_SOURCE_ID = 'auth';
const LOG_ROW_MESSAGE_PREVIEW_LIMIT = 180;
const LOG_ROW_CONTEXT_PREVIEW_LIMIT = 120;

const LINE_OPTIONS = [50, 100, 200, 500];
const JSON_MESSAGE_KEYS = ['message', 'msg', 'log', 'body', 'event'] as const;
const JSON_KEY_VALUE_KEYS = ['event', 'payload', 'data', 'attributes'] as const;
const JSON_TIME_KEYS = [
  'timestamp',
  'time',
  'ts',
  '@timestamp',
  'datetime',
] as const;
const JSON_LEVEL_KEYS = ['level', 'severity', 'status', 'priority'] as const;

type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'fatal';

export interface ParsedLogLine {
  id: string;
  lineNumber: number;
  raw: string;
  message: string;
  timestamp?: string;
  level: LogLevel;
  jsonPayload?: unknown;
  jsonLabel?: string;
  jsonPrefix?: string;
  jsonSuffix?: string;
  sourceLabel: string;
  searchText: string;
}

interface JsonSegment {
  value: unknown;
  label?: string;
  prefix?: string;
  suffix?: string;
}

const LEVEL_STYLE: Record<LogLevel, string> = {
  debug: 'border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  info: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  notice:
    'border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  warn: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  error: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300',
  fatal: 'border-red-600/30 bg-red-600/15 text-red-700 dark:text-red-200',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function coerceText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function extractTextField(
  record: Record<string, unknown>,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = coerceText(record[key]);
    if (value) return value;
  }

  return undefined;
}

function safeJsonStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function compactLogText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateLogText(value: string, limit: number) {
  const compacted = compactLogText(value);
  if (compacted.length <= limit) {
    return {
      isTruncated: false,
      text: compacted,
    };
  }

  return {
    isTruncated: true,
    text: `${compacted.slice(0, limit).trimEnd()}...`,
  };
}

function isJsonLikeLogText(value: string) {
  const trimmed = value.trim();

  return (
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    /(?:^|\s)(event|payload|data|attributes)=["']?[{[]/.test(trimmed)
  );
}

function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function repairMalformedJsonCandidate(candidate: string) {
  return candidate.replace(/:\s*(?=,|}|\])/g, ': null');
}

function parseJsonCandidate(candidate: string): unknown | undefined {
  const variants = [candidate];

  if (candidate.includes('\\"')) {
    variants.push(candidate.replaceAll('\\"', '"'));
  }

  for (const variant of variants) {
    try {
      return JSON.parse(variant);
    } catch {
      // Some agent payloads temporarily report empty values such as
      // `"capabilities": ,` while the surrounding event is still useful.
    }

    const repaired = repairMalformedJsonCandidate(variant);
    if (repaired === variant) continue;

    try {
      return JSON.parse(repaired);
    } catch {
      // Fall through to the next representation.
    }
  }

  return undefined;
}

function getMatchingJsonEnd(raw: string, startIndex: number) {
  const first = raw[startIndex];
  const opening = first === '{' ? '{' : '[';
  const closing = first === '{' ? '}' : ']';
  const stack = [opening];
  let escaped = false;
  let inString = false;

  for (let index = startIndex + 1; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{' || char === '[') {
      stack.push(char);
      continue;
    }

    if (char === '}' || char === ']') {
      const expected = stack.at(-1) === '{' ? '}' : ']';
      if (char !== expected) return undefined;

      stack.pop();
      if (stack.length === 0 && char === closing) return index;
    }
  }

  return undefined;
}

function getJsonLabelAndPrefix(rawPrefix: string) {
  const match = rawPrefix.match(/([A-Za-z0-9_.-]+)=["']?$/);

  if (!match) {
    return {
      prefix: rawPrefix.trim(),
    };
  }

  return {
    label: match[1],
    prefix: rawPrefix.slice(0, match.index).trim(),
  };
}

function buildJsonSegmentFromTail(params: {
  label?: string;
  prefix?: string;
  tail: string;
}): JsonSegment | undefined {
  const { label, prefix, tail } = params;
  const variants = [tail];

  if (tail.includes('\\"')) {
    variants.push(tail.replaceAll('\\"', '"'));
  }

  for (const variant of variants) {
    const firstChar = variant[0];
    if (firstChar !== '{' && firstChar !== '[') continue;

    const endIndex = getMatchingJsonEnd(variant, 0);
    if (endIndex == null) continue;

    const candidate = variant.slice(0, endIndex + 1);
    const value = parseJsonCandidate(candidate);
    if (value === undefined) continue;

    return {
      value,
      label,
      prefix,
      suffix: cleanJsonSuffix(variant.slice(endIndex + 1)),
    };
  }

  return undefined;
}

function findKeyValueJsonSegment(
  raw: string,
  keys: readonly string[],
): JsonSegment | undefined {
  for (const key of keys) {
    const pattern = new RegExp(`(?:^|\\s)${key}=(["'])?`, 'g');
    let match: RegExpExecArray | null = pattern.exec(raw);

    while (match) {
      const valueStart = match.index + match[0].length;
      const valueTail = raw.slice(valueStart);
      const objectIndex = valueTail.indexOf('{');
      const arrayIndex = valueTail.indexOf('[');
      const firstJsonIndex =
        objectIndex >= 0 && arrayIndex >= 0
          ? Math.min(objectIndex, arrayIndex)
          : Math.max(objectIndex, arrayIndex);

      if (firstJsonIndex >= 0) {
        const jsonStart = valueStart + firstJsonIndex;
        const segment = buildJsonSegmentFromTail({
          label: key,
          prefix: raw.slice(0, match.index).trim(),
          tail: raw.slice(jsonStart),
        });

        if (segment) return segment;
      }

      match = pattern.exec(raw);
    }
  }

  return undefined;
}

function cleanJsonSuffix(rawSuffix: string) {
  return rawSuffix.replace(/^["']/, '').trim();
}

function buildJsonSegment(
  raw: string,
  startIndex: number,
  endIndex: number,
): JsonSegment | undefined {
  const candidate = raw.slice(startIndex, endIndex + 1);
  const value = parseJsonCandidate(candidate);
  if (value === undefined) return undefined;

  const { label, prefix } = getJsonLabelAndPrefix(raw.slice(0, startIndex));
  const suffix = cleanJsonSuffix(raw.slice(endIndex + 1));

  return {
    value,
    label,
    prefix,
    suffix,
  };
}

function findJsonSegment(raw: string): JsonSegment | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const keyValueSegment = findKeyValueJsonSegment(raw, JSON_KEY_VALUE_KEYS);
  if (keyValueSegment) return keyValueSegment;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== '{' && char !== '[') continue;

    const endIndex = getMatchingJsonEnd(raw, index);

    if (endIndex != null) {
      const segment = buildJsonSegment(raw, index, endIndex);
      if (segment) return segment;
    }
  }

  const objectStart = raw.indexOf('{');
  const objectEnd = raw.lastIndexOf('}');

  if (objectStart >= 0 && objectEnd > objectStart) {
    const segment = buildJsonSegment(raw, objectStart, objectEnd);
    if (segment) return segment;
  }

  const arrayStart = raw.indexOf('[');
  const arrayEnd = raw.lastIndexOf(']');

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return buildJsonSegment(raw, arrayStart, arrayEnd);
  }

  return undefined;
}

function normalizeLevel(value: unknown, raw: string): LogLevel {
  const explicit = coerceText(value)?.toLowerCase();

  if (explicit) {
    if (/\b(fatal|panic|critical|crit)\b/.test(explicit)) return 'fatal';
    if (/\b(error|err|failed|failure|denied|exception)\b/.test(explicit)) {
      return 'error';
    }
    if (/\b(warn|warning)\b/.test(explicit)) return 'warn';
    if (/\b(notice|success|succeeded|started|stopped)\b/.test(explicit)) {
      return 'notice';
    }
    if (/\b(debug|trace|verbose)\b/.test(explicit)) return 'debug';
    if (/\b(info|running|ok|healthy|ready)\b/.test(explicit)) return 'info';
  }

  const normalized = raw.toLowerCase();

  if (/\b(fatal|panic|critical|crit)\b/.test(normalized)) return 'fatal';
  if (/\b(error|err|failed|failure|denied|exception)\b/.test(normalized)) {
    return 'error';
  }
  if (/\b(warn|warning)\b/.test(normalized)) return 'warn';
  if (/\b(notice|success|succeeded|started|stopped)\b/.test(normalized)) {
    return 'notice';
  }
  if (/\b(debug|trace|verbose)\b/.test(normalized)) return 'debug';

  return 'info';
}

function parsePlainLogLine(raw: string) {
  const isoMatch = raw.match(
    /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(.*)$/,
  );

  if (isoMatch) {
    return {
      timestamp: isoMatch[1],
      message: isoMatch[2] || raw,
    };
  }

  const syslogMatch = raw.match(
    /^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^:]+):\s?(.*)$/,
  );

  if (syslogMatch) {
    return {
      timestamp: syslogMatch[1],
      message: syslogMatch[4] || raw,
      source: syslogMatch[3],
    };
  }

  return {
    message: raw,
  };
}

function parseDpanelAgentMessage(rawMessage: string) {
  const match = rawMessage.match(
    /^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.*)$/,
  );

  if (!match) {
    return {
      body: rawMessage,
    };
  }

  return {
    timestamp: match[1],
    body: match[2] || rawMessage,
  };
}

function isDpanelAgentSyslogLine(params: {
  plain: ReturnType<typeof parsePlainLogLine>;
  raw: string;
  source: ServerLogSource | undefined;
}) {
  const { plain, raw, source } = params;
  if (source?.path !== '/var/log/syslog') return false;

  const normalized =
    `${plain.source ?? ''} ${plain.message} ${raw}`.toLowerCase();

  return normalized.includes('dpanel-agent') || normalized.includes(' event=');
}

function getDpanelEventSummary(eventPayload: unknown) {
  if (!isRecord(eventPayload)) return safeJsonStringify(eventPayload);

  return (
    extractTextField(eventPayload, ['event_id']) ??
    extractTextField(eventPayload, ['event_type']) ??
    extractTextField(eventPayload, JSON_MESSAGE_KEYS) ??
    safeJsonStringify(eventPayload)
  );
}

function parseDpanelAgentSyslogLine(params: {
  lineIndex: number;
  plain: ReturnType<typeof parsePlainLogLine>;
  raw: string;
  source: ServerLogSource | undefined;
}): ParsedLogLine | undefined {
  const { lineIndex, plain, raw, source } = params;
  if (!isDpanelAgentSyslogLine({ plain, raw, source })) return undefined;

  const agentMessage = parseDpanelAgentMessage(plain.message);
  const eventSegment =
    findKeyValueJsonSegment(agentMessage.body, ['event']) ??
    findKeyValueJsonSegment(raw, ['event']);

  if (!isRecord(eventSegment?.value) && !Array.isArray(eventSegment?.value)) {
    return undefined;
  }

  const eventPayload = eventSegment.value;
  const message = getDpanelEventSummary(eventPayload);
  const timestamp = isRecord(eventPayload)
    ? (extractTextField(eventPayload, JSON_TIME_KEYS) ??
      agentMessage.timestamp ??
      plain.timestamp)
    : (agentMessage.timestamp ?? plain.timestamp);
  const levelValue = isRecord(eventPayload)
    ? extractTextField(eventPayload, JSON_LEVEL_KEYS)
    : undefined;
  const level = normalizeLevel(levelValue, message);

  return {
    id: `${lineIndex}-${raw}`,
    lineNumber: lineIndex + 1,
    raw,
    message,
    timestamp,
    level,
    jsonPayload: eventPayload,
    jsonLabel: eventSegment.label,
    sourceLabel: plain.source ?? 'dPanel Agent',
    searchText: `${raw} ${message} ${timestamp ?? ''} ${level} ${safeJsonStringify(eventPayload)}`,
  };
}

export function parseLogLine(
  raw: string,
  lineIndex: number,
  source: ServerLogSource | undefined,
): ParsedLogLine {
  const plain = parsePlainLogLine(raw);
  const dpanelAgentLine = parseDpanelAgentSyslogLine({
    lineIndex,
    plain,
    raw,
    source,
  });

  if (dpanelAgentLine) return dpanelAgentLine;

  const jsonSegment = findJsonSegment(plain.message) ?? findJsonSegment(raw);
  const sourceLabel = source?.label ?? 'Log';

  if (isRecord(jsonSegment?.value)) {
    const message =
      extractTextField(jsonSegment.value, JSON_MESSAGE_KEYS) ??
      jsonSegment.label ??
      safeJsonStringify(jsonSegment.value);
    const timestamp =
      extractTextField(jsonSegment.value, JSON_TIME_KEYS) ?? plain.timestamp;
    const levelValue = extractTextField(jsonSegment.value, JSON_LEVEL_KEYS);
    const level = normalizeLevel(levelValue, `${message} ${raw}`);

    return {
      id: `${lineIndex}-${raw}`,
      lineNumber: lineIndex + 1,
      raw,
      message,
      timestamp,
      level,
      jsonPayload: jsonSegment.value,
      jsonLabel: jsonSegment.label,
      jsonPrefix: jsonSegment.prefix,
      jsonSuffix: jsonSegment.suffix,
      sourceLabel: plain.source ?? sourceLabel,
      searchText: `${raw} ${message} ${timestamp ?? ''} ${level} ${safeJsonStringify(jsonSegment.value)}`,
    };
  }

  if (Array.isArray(jsonSegment?.value)) {
    const message = jsonSegment.label ?? safeJsonStringify(jsonSegment.value);

    return {
      id: `${lineIndex}-${raw}`,
      lineNumber: lineIndex + 1,
      raw,
      message,
      level: normalizeLevel(undefined, raw),
      jsonPayload: jsonSegment.value,
      jsonLabel: jsonSegment.label,
      jsonPrefix: jsonSegment.prefix,
      jsonSuffix: jsonSegment.suffix,
      sourceLabel: plain.source ?? sourceLabel,
      searchText: `${raw} ${message} ${safeJsonStringify(jsonSegment.value)}`,
    };
  }

  const level = normalizeLevel(undefined, plain.message);

  return {
    id: `${lineIndex}-${raw}`,
    lineNumber: lineIndex + 1,
    raw,
    message: plain.message,
    timestamp: plain.timestamp,
    level,
    sourceLabel: plain.source ?? sourceLabel,
    searchText: `${raw} ${plain.message} ${plain.timestamp ?? ''} ${plain.source ?? ''} ${level}`,
  };
}

function StructuredJsonPreview(props: { value: unknown }) {
  const { value } = props;
  if (!isRecord(value)) return null;

  const previewKeys = [
    'event_id',
    'event_type',
    'status',
    'severity',
    'source',
    'machine_id',
    'agent_id',
  ];
  const items = previewKeys
    .map((key) => {
      const valueText = coerceText(value[key]);
      if (!valueText) return null;

      return {
        key,
        value: valueText,
      };
    })
    .filter((item): item is { key: string; value: string } => item != null)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <span className="mt-1 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex max-w-full items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
        >
          <span>{item.key}</span>
          <span className="max-w-36 truncate font-semibold text-primary">
            {item.value}
          </span>
        </span>
      ))}
    </span>
  );
}

function ToolbarIconButton(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  title: string;
  onClick: () => void;
}) {
  const { children, className, disabled, title, onClick } = props;

  return (
    <button
      type="button"
      aria-label={title}
      className={cn(
        'flex size-8 cursor-pointer items-center justify-center rounded-md border bg-card text-primary/70 transition-colors hover:bg-border/60 disabled:cursor-default disabled:opacity-40',
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function LogLevelBadge(props: { level: LogLevel }) {
  const { level } = props;

  return (
    <span
      className={cn(
        'inline-flex w-14 items-center justify-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
        LEVEL_STYLE[level],
      )}
    >
      {level}
    </span>
  );
}

function LogPreviewBadge(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <span className="shrink-0 rounded border bg-background px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

export function LogRow(props: {
  entry: ParsedLogLine;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { entry, expanded, onToggle } = props;
  const canExpand = entry.jsonPayload !== undefined;
  const messagePreview = truncateLogText(
    entry.message || ' ',
    LOG_ROW_MESSAGE_PREVIEW_LIMIT,
  );
  const contextPreview = truncateLogText(
    [entry.jsonPrefix, entry.jsonSuffix].filter(Boolean).join(' '),
    LOG_ROW_CONTEXT_PREVIEW_LIMIT,
  );
  const showJsonLikeBadge =
    !canExpand &&
    isJsonLikeLogText(`${entry.message} ${entry.jsonPrefix ?? ''}`);
  const rowClassName =
    'grid w-full grid-cols-[44px_160px_72px_120px_minmax(0,1fr)] items-start gap-3 px-3 py-2 text-left transition-colors';
  const rowContent = (
    <>
      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        {canExpand ? (
          expanded ? (
            <ChevronDownIcon className="size-3" />
          ) : (
            <ChevronRightIcon className="size-3" />
          )
        ) : (
          <span className="size-3" />
        )}
        {entry.lineNumber}
      </span>
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        {entry.timestamp ?? '-'}
      </span>
      <LogLevelBadge level={entry.level} />
      <span className="truncate text-xs text-muted-foreground">
        {entry.sourceLabel}
      </span>
      <span className="grid min-w-0 max-w-full gap-1 overflow-hidden font-mono text-xs leading-5 text-primary">
        <span className="flex min-w-0 max-w-full items-start gap-1.5 overflow-hidden">
          {entry.jsonLabel ? (
            <LogPreviewBadge>{entry.jsonLabel}</LogPreviewBadge>
          ) : null}
          {showJsonLikeBadge ? (
            <LogPreviewBadge>raw json</LogPreviewBadge>
          ) : null}
          <span className="max-h-10 min-w-0 max-w-full overflow-hidden break-all">
            {messagePreview.text || ' '}
          </span>
          {messagePreview.isTruncated ? (
            <LogPreviewBadge>truncated</LogPreviewBadge>
          ) : null}
        </span>
        {contextPreview.text ? (
          <span className="min-w-0 max-w-full break-all text-[11px] leading-4 text-muted-foreground">
            {contextPreview.text}
            {contextPreview.isTruncated ? (
              <span className="ml-1 font-semibold text-primary/60">
                truncated
              </span>
            ) : null}
          </span>
        ) : null}
        {entry.jsonPayload !== undefined ? (
          <StructuredJsonPreview value={entry.jsonPayload} />
        ) : null}
      </span>
    </>
  );

  return (
    <div className="border-b last:border-b-0">
      {canExpand ? (
        <button
          type="button"
          aria-expanded={expanded}
          className={cn(rowClassName, 'cursor-pointer hover:bg-border/40')}
          onClick={onToggle}
        >
          {rowContent}
        </button>
      ) : (
        <div className={rowClassName}>{rowContent}</div>
      )}

      {canExpand && expanded ? (
        <div className="border-t bg-background/60 px-3 py-3">
          <div className="grid grid-cols-[44px_1fr] gap-3">
            <span />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <BracesIcon className="size-4 text-muted-foreground" />
                Structured payload
              </div>
              <pre className="max-h-96 overflow-auto rounded-md border bg-card p-3 font-mono text-xs leading-5 text-primary">
                {formatJson(entry.jsonPayload)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function getResponseErrorMessage(error: ResponseError) {
  return getApiErrorDetail(error.error);
}

export function isEmptyLogResponse(error: ResponseError) {
  return /data is empty/i.test(getResponseErrorMessage(error));
}

export function getLogViewerLines(response: DTOs.ServerLogViewerV1) {
  const rawResponse = response as unknown;

  if (Array.isArray(rawResponse)) {
    return rawResponse.filter(
      (line): line is string => typeof line === 'string',
    );
  }

  if (response.lines?.length) return response.lines;

  return (
    response.entries
      ?.map((entry) => entry.line ?? safeJsonStringify(entry))
      .filter((line): line is string => Boolean(line)) ?? []
  );
}

function LogViewerState(props: {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
  tone?: 'danger' | 'muted';
}) {
  const { action, description, icon: Icon, title, tone = 'muted' } = props;

  return (
    <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-lg border bg-background',
            tone === 'danger'
              ? 'border-red-500/25 text-red-500'
              : 'text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? (
          <div className="flex items-center gap-2">{action}</div>
        ) : null}
      </div>
    </div>
  );
}

export function useServerLogSourceDiscovery(serverId: string) {
  const [rootLogsResponse, refreshRootLogs] = ApiFolder.Origin.$ServerId.useGet(
    {
      serverId,
      basePath: SERVER_LOG_DISCOVERY_PATHS.root,
    },
  );
  const [aptLogsResponse, refreshAptLogs] = ApiFolder.Origin.$ServerId.useGet({
    serverId,
    basePath: SERVER_LOG_DISCOVERY_PATHS.apt,
  });
  const [caddyLogsResponse, refreshCaddyLogs] =
    ApiFolder.Origin.$ServerId.useGet({
      serverId,
      basePath: SERVER_LOG_DISCOVERY_PATHS.caddy,
    });
  const [dpanelAgentLogsResponse, refreshDpanelAgentLogs] =
    ApiFolder.Origin.$ServerId.useGet({
      serverId,
      basePath: SERVER_LOG_DISCOVERY_PATHS.dpanelAgent,
    });

  const responses = useMemo(
    () => [
      rootLogsResponse,
      aptLogsResponse,
      caddyLogsResponse,
      dpanelAgentLogsResponse,
    ],
    [
      aptLogsResponse,
      caddyLogsResponse,
      dpanelAgentLogsResponse,
      rootLogsResponse,
    ],
  );

  const sources = useMemo(
    () =>
      buildServerLogSourcesFromDiscovery([
        {
          ...SERVER_LOG_DISCOVERY_DIRECTORIES[0],
          entries:
            rootLogsResponse.$status === 'success'
              ? rootLogsResponse
              : undefined,
        },
        {
          ...SERVER_LOG_DISCOVERY_DIRECTORIES[1],
          entries:
            aptLogsResponse.$status === 'success' ? aptLogsResponse : undefined,
        },
        {
          ...SERVER_LOG_DISCOVERY_DIRECTORIES[2],
          entries:
            caddyLogsResponse.$status === 'success'
              ? caddyLogsResponse
              : undefined,
        },
        {
          ...SERVER_LOG_DISCOVERY_DIRECTORIES[3],
          entries:
            dpanelAgentLogsResponse.$status === 'success'
              ? dpanelAgentLogsResponse
              : undefined,
        },
      ]),
    [
      aptLogsResponse,
      caddyLogsResponse,
      dpanelAgentLogsResponse,
      rootLogsResponse,
    ],
  );

  const refresh = useCallback(() => {
    refreshRootLogs();
    refreshAptLogs();
    refreshCaddyLogs();
    refreshDpanelAgentLogs();
  }, [
    refreshAptLogs,
    refreshCaddyLogs,
    refreshDpanelAgentLogs,
    refreshRootLogs,
  ]);

  return {
    hasFailed: responses.some((response) => response.$status === 'failed'),
    isLoading: responses.some(
      (response) =>
        response.$status === 'initial' || response.$status === 'loading',
    ),
    refresh,
    sources,
  };
}

export default function ServerLogViewerSidepanel(props: Props) {
  const { serverId, serverName } = props;

  const [selectedSourceId, setSelectedSourceId] = useState(DEFAULT_SOURCE_ID);
  const [lineCount, setLineCount] = useState(DEFAULT_LINE_COUNT);
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const logViewportRef = useRef<HTMLDivElement>(null);

  const [logResponse, fetchLog] = ApiServer.Origin.$Id.Log.useGetLazy();

  const sourceDiscovery = useServerLogSourceDiscovery(serverId);
  const isUsingDiscoveredSources = sourceDiscovery.sources.length > 0;
  const sourceCatalog = useMemo(() => {
    if (!isUsingDiscoveredSources) return VM_LOG_SOURCES;

    const overviewSources = VM_LOG_SOURCES.filter((source) => !source.path);
    return [...overviewSources, ...sourceDiscovery.sources];
  }, [isUsingDiscoveredSources, sourceDiscovery.sources]);

  const sourceFileCount = useMemo(
    () => sourceCatalog.filter((source) => source.path).length,
    [sourceCatalog],
  );

  const filteredSourceCatalog = useMemo(() => {
    const normalizedQuery = sourceSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return sourceCatalog;

    return sourceCatalog.filter((source) =>
      `${source.label} ${source.path ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [sourceCatalog, sourceSearchQuery]);

  const filteredSourceFileCount = useMemo(
    () => filteredSourceCatalog.filter((source) => source.path).length,
    [filteredSourceCatalog],
  );

  const sourceStatusText = sourceDiscovery.isLoading
    ? 'Discovering...'
    : sourceDiscovery.hasFailed && !isUsingDiscoveredSources
      ? 'Default sources'
      : `${sourceFileCount} log files`;

  const resolvedSelectedSourceId = useMemo(() => {
    const matchingSource = sourceCatalog.find(
      (source) => source.id === selectedSourceId,
    );
    if (matchingSource) return matchingSource.id;

    return (
      sourceCatalog.find((source) => source.id === DEFAULT_SOURCE_ID)?.id ??
      sourceCatalog.find((source) => source.path)?.id ??
      sourceCatalog[0]?.id ??
      selectedSourceId
    );
  }, [selectedSourceId, sourceCatalog]);

  const selectedSource = useMemo<ServerLogSource | undefined>(() => {
    return sourceCatalog.find(
      (source) => source.id === resolvedSelectedSourceId,
    );
  }, [resolvedSelectedSourceId, sourceCatalog]);

  useEffect(() => {
    if (!selectedSource) return;

    fetchLog({
      serverId,
      file: selectedSource.path,
      line: lineCount,
    });
  }, [fetchLog, lineCount, resolvedSelectedSourceId, selectedSource, serverId]);

  const logLines = useMemo(
    () =>
      logResponse.$status === 'success' ? getLogViewerLines(logResponse) : [],
    [logResponse],
  );

  const parsedLogLines = useMemo(
    () =>
      logLines.map((line, index) => parseLogLine(line, index, selectedSource)),
    [logLines, selectedSource],
  );

  const filteredLogLines = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return parsedLogLines;

    return parsedLogLines.filter((line) =>
      line.searchText.toLowerCase().includes(normalizedQuery),
    );
  }, [parsedLogLines, searchQuery]);

  const activePath = selectedSource?.path ?? 'All VM logs';
  const latestLogLine =
    logLines.length > 0 ? logLines[logLines.length - 1] : '';
  const isEmptyLogFile =
    logResponse.$status === 'failed' && isEmptyLogResponse(logResponse);

  useEffect(() => {
    if (logResponse.$status !== 'success') return;

    const viewport = logViewportRef.current;
    if (!viewport) return;

    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [
    activePath,
    latestLogLine,
    lineCount,
    logLines.length,
    logResponse.$status,
  ]);

  const handleClickSource = (source: ServerLogSource) => {
    setSelectedSourceId(source.id);
    setExpandedRows(new Set());
  };

  const handleRefresh = () => {
    if (!selectedSource) return;

    fetchLog({
      serverId,
      file: selectedSource.path,
      line: lineCount,
    });
  };

  const toggleExpanded = (lineId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);

      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }

      return next;
    });
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[1120px]">
      <Layout.Title
        className="bg-background"
        title="Log Viewer"
        subtitle={serverName || `Server ID: ${serverId}`}
        hasCloseButton
      />

      <div className="grid h-full min-h-0 flex-1 grid-cols-[300px_1fr] overflow-hidden border-t bg-background">
        <aside className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden border-r">
          <div className="space-y-3 border-b bg-card/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <FileTextIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-primary">
                    Sources
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {sourceStatusText}
                  </span>
                </span>
              </div>

              <ToolbarIconButton
                className="shrink-0 bg-background"
                disabled={sourceDiscovery.isLoading}
                onClick={sourceDiscovery.refresh}
                title="Refresh log sources"
              >
                <RefreshCwIcon
                  className={cn(
                    'size-4',
                    sourceDiscovery.isLoading && 'animate-spin',
                  )}
                />
              </ToolbarIconButton>
            </div>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-8"
                inputSize="sm"
                value={sourceSearchQuery}
                placeholder="Search log files"
                onChange={(event) => setSourceSearchQuery(event.target.value)}
              />
            </div>

            {sourceSearchQuery.trim() ? (
              <p className="px-1 text-xs text-muted-foreground">
                Showing {filteredSourceFileCount} of {sourceFileCount} log files
              </p>
            ) : null}
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-2">
            {VM_LOG_SOURCE_CATEGORIES.map((category) => {
              const sources = filteredSourceCatalog.filter(
                (source) => source.category === category.id,
              );
              if (sources.length === 0) return null;

              return (
                <section key={category.id} className="space-y-1">
                  <p className="px-2 text-[11px] font-medium uppercase text-muted-foreground">
                    {category.label}
                  </p>
                  {sources.map((source) => {
                    const isSelected = resolvedSelectedSourceId === source.id;

                    return (
                      <button
                        key={source.id}
                        type="button"
                        title={source.path ?? source.label}
                        onClick={() => handleClickSource(source)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors',
                          isSelected
                            ? 'border-border bg-card text-primary shadow-sm'
                            : 'border-transparent text-primary hover:bg-border/60',
                        )}
                      >
                        <ScrollTextIcon
                          className={cn(
                            'size-3.5 shrink-0',
                            isSelected
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">
                            {source.label}
                          </span>
                          {source.path ? (
                            <span
                              className={cn(
                                'block truncate text-[11px]',
                                isSelected
                                  ? 'text-muted-foreground'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {source.path}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </section>
              );
            })}

            {filteredSourceCatalog.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted-foreground">
                No log files match the search.
              </p>
            ) : null}
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-tl-xl border-l border-t bg-card">
          <div className="grid gap-3 border-b p-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ScrollTextIcon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-primary">
                    {selectedSource?.label ?? 'Logs'}
                  </p>
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {activePath}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Select
                  value={String(lineCount)}
                  onValueChange={(value) => setLineCount(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[106px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_OPTIONS.map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value} lines
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ToolbarIconButton
                  disabled={
                    !selectedSource || logResponse.$status === 'loading'
                  }
                  onClick={handleRefresh}
                  title="Refresh"
                >
                  <RefreshCwIcon
                    className={cn(
                      'size-4',
                      logResponse.$status === 'loading' && 'animate-spin',
                    )}
                  />
                </ToolbarIconButton>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <Input
                inputSize="sm"
                value={searchQuery}
                placeholder="Filter logs"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {filteredLogLines.length} / {parsedLogLines.length}
              </p>
            </div>
          </div>

          <div ref={logViewportRef} className="min-h-0 overflow-y-auto">
            {logResponse.$status === 'initial' ||
            logResponse.$status === 'loading' ? (
              <LogViewerState
                description="Fetching the latest lines from the selected source."
                icon={ScrollTextIcon}
                title="Loading log entries"
                action={<Spinner size="sm" />}
              />
            ) : logResponse.$status === 'failed' && isEmptyLogFile ? (
              <LogViewerState
                description="This log file exists, but no entries were returned for the selected range."
                icon={InboxIcon}
                title="No log entries yet"
                action={
                  <Button
                    buttonColor="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCwIcon className="size-4" />
                    Refresh
                  </Button>
                }
              />
            ) : logResponse.$status === 'failed' ? (
              <LogViewerState
                description={getResponseErrorMessage(logResponse)}
                icon={AlertCircleIcon}
                title="Unable to load logs"
                tone="danger"
                action={
                  <Button
                    buttonColor="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCwIcon className="size-4" />
                    Retry
                  </Button>
                }
              />
            ) : parsedLogLines.length === 0 ? (
              <LogViewerState
                description="The selected source returned an empty log for the current line limit."
                icon={InboxIcon}
                title="No log entries yet"
                action={
                  <Button
                    buttonColor="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCwIcon className="size-4" />
                    Refresh
                  </Button>
                }
              />
            ) : filteredLogLines.length === 0 ? (
              <LogViewerState
                description="Try a different keyword or clear the filter to see all returned log lines."
                icon={FileSearchIcon}
                title="No matching log lines"
                action={
                  <Button
                    buttonColor="secondary"
                    buttonStyle="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear filter
                  </Button>
                }
              />
            ) : (
              <div className="min-w-[780px]">
                <div className="sticky top-0 z-10 grid grid-cols-[44px_160px_72px_120px_minmax(0,1fr)] gap-3 border-b bg-card px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                  <span>#</span>
                  <span>Time</span>
                  <span>Level</span>
                  <span>Source</span>
                  <span>Message</span>
                </div>
                {filteredLogLines.map((entry) => (
                  <LogRow
                    key={entry.id}
                    entry={entry}
                    expanded={expandedRows.has(entry.id)}
                    onToggle={() => toggleExpanded(entry.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
