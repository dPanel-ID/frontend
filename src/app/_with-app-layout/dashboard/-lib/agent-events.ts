import dayjs from 'dayjs';

import type { DTOs } from '@/shared/api';

export const DASHBOARD_AGENT_EVENT_LINE_COUNT = 200;
export const DASHBOARD_AGENT_EVENT_LOG_FILE = '/var/log/syslog';

const ANSI_ESCAPE_PATTERN = new RegExp(
  `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
  'g',
);
const AGENT_EVENT_MESSAGE_KEYS = ['message', 'msg', 'body', 'event'] as const;
const AGENT_EVENT_TIME_KEYS = [
  'timestamp',
  'time',
  'ts',
  '@timestamp',
] as const;
const AGENT_EVENT_LEVEL_KEYS = ['severity', 'level', 'status'] as const;
const HIDDEN_AGENT_EVENT_DETAIL_KEYS = new Set(['capabilities', 'modules']);
const SENSITIVE_DETAIL_KEY_PATTERN =
  /(password|passwd|token|secret|api[_-]?key|credential|authorization|private[_-]?key|access[_-]?key)/i;

export type DashboardAgentEventLevel =
  | 'debug'
  | 'info'
  | 'notice'
  | 'warn'
  | 'error';

export interface DashboardAgentEvent {
  id: string;
  serverId: string;
  serverName: string;
  eventId?: string;
  eventType?: string;
  agentId?: string;
  machineId?: string;
  message: string;
  timestamp?: string;
  level: DashboardAgentEventLevel;
  status?: string;
  sequence?: string;
  details: Record<string, unknown>;
  sortTime: number;
}

interface JsonSegment {
  value: unknown;
}

export function parseAgentEventsFromLines(
  lines: string[],
  server: DTOs.MachineV1,
) {
  return lines.flatMap((line, lineIndex) => {
    const event = parseAgentEventLine(line, lineIndex, server);
    return event ? [event] : [];
  });
}

export function dedupeAgentEvents(events: DashboardAgentEvent[]) {
  const seen = new Set<string>();

  return events.filter((event) => {
    const key = event.eventId
      ? `event:${event.eventId}`
      : `${event.serverId}:${event.timestamp ?? ''}:${event.message}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatEventType(value?: string) {
  if (!value) return '';

  return value
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatEventTimestamp(value?: string) {
  const timestamp = timestampMs(value);
  if (!timestamp) return undefined;
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseAgentEventLine(
  line: string,
  lineIndex: number,
  server: DTOs.MachineV1,
): DashboardAgentEvent | undefined {
  const raw = stripAnsi(line).trim();
  if (!raw) return undefined;

  const payload = extractDpanelAgentEventPayload(raw);
  if (!payload) return undefined;

  const serverId = String(server.id ?? '');
  const eventId = extractTextField(payload, ['event_id']);
  const eventType = extractTextField(payload, ['event_type']);
  const message =
    extractTextField(payload, AGENT_EVENT_MESSAGE_KEYS) ??
    eventType ??
    eventId ??
    'dPanel agent event';
  const timestamp =
    extractTextField(payload, AGENT_EVENT_TIME_KEYS) ??
    extractAgentLineTimestamp(raw);
  const status = extractTextField(payload, ['status']);
  const level = normalizeAgentEventLevel(
    extractTextField(payload, AGENT_EVENT_LEVEL_KEYS),
    `${status ?? ''} ${message}`,
  );
  const sequence = extractTextField(payload, ['sequence']);
  const machineId = extractTextField(payload, ['machine_id']) ?? serverId;
  const agentId = extractTextField(payload, ['agent_id']);
  const sortTime = timestampMs(timestamp) || lineIndex;

  return {
    id: `${serverId}:${eventId ?? `${sortTime}:${lineIndex}:${message}`}`,
    serverId,
    serverName: resolveServerDisplayName(server),
    eventId,
    eventType,
    agentId,
    machineId,
    message,
    timestamp,
    level,
    status,
    sequence,
    details: buildAgentEventDetails(payload),
    sortTime,
  };
}

function extractDpanelAgentEventPayload(
  raw: string,
): Record<string, unknown> | undefined {
  const eventSegment = findKeyValueJsonSegment(raw, ['event']);
  if (isRecord(eventSegment?.value)) return eventSegment.value;

  const directSegment = findJsonSegment(raw);
  if (
    isRecord(directSegment?.value) &&
    (directSegment.value.event_id ||
      directSegment.value.event_type ||
      directSegment.value.agent_id)
  ) {
    return directSegment.value;
  }

  return undefined;
}

function extractAgentLineTimestamp(raw: string) {
  const agentTimestamp = raw.match(/(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})/);
  if (agentTimestamp) return agentTimestamp[1];

  const isoTimestamp = raw.match(
    /(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,
  );
  return isoTimestamp?.[1];
}

function buildAgentEventDetails(payload: Record<string, unknown>) {
  const details: Record<string, unknown> = {};

  for (const key of [
    'event_id',
    'event_type',
    'source',
    'status',
    'severity',
    'machine_id',
    'agent_id',
    'sequence',
    'timestamp',
  ]) {
    if (payload[key] != null) details[key] = payload[key];
  }

  if (isRecord(payload.attributes)) {
    const attributes = sanitizeEventDetailRecord(payload.attributes);
    if (Object.keys(attributes).length > 0) details.attributes = attributes;
  }

  return sanitizeEventDetailRecord(details);
}

function sanitizeEventDetailRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      if (HIDDEN_AGENT_EVENT_DETAIL_KEYS.has(key.toLowerCase())) return [];

      if (SENSITIVE_DETAIL_KEY_PATTERN.test(key)) {
        return [[key, '[redacted]']];
      }

      const sanitized = sanitizeEventDetailValue(value, key);
      return sanitized === undefined ? [] : [[key, sanitized]];
    }),
  );
}

function sanitizeEventDetailValue(
  value: unknown,
  key: string,
): unknown | undefined {
  if (HIDDEN_AGENT_EVENT_DETAIL_KEYS.has(key.toLowerCase())) return undefined;

  if (Array.isArray(value)) {
    if (value.length > 6) return `${value.length} items`;
    return value
      .map((item) => sanitizeEventDetailValue(item, key))
      .filter((item) => item !== undefined);
  }

  if (isRecord(value)) {
    return sanitizeEventDetailRecord(value);
  }

  if (typeof value === 'string') {
    return redactSensitiveText(value);
  }

  return value;
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
        const segment = buildJsonSegmentFromTail(
          raw.slice(valueStart + firstJsonIndex),
        );
        if (segment) return segment;
      }

      match = pattern.exec(raw);
    }
  }

  return undefined;
}

function findJsonSegment(raw: string): JsonSegment | undefined {
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char !== '{' && char !== '[') continue;

    const segment = buildJsonSegmentFromTail(raw.slice(index));
    if (segment) return segment;
  }

  return undefined;
}

function buildJsonSegmentFromTail(tail: string): JsonSegment | undefined {
  const variants = tail.includes('\\"')
    ? [tail, tail.replaceAll('\\"', '"')]
    : [tail];

  for (const variant of variants) {
    const firstChar = variant[0];
    if (firstChar !== '{' && firstChar !== '[') continue;

    const endIndex = getMatchingJsonEnd(variant, 0);
    if (endIndex == null) continue;

    const value = parseJsonCandidate(variant.slice(0, endIndex + 1));
    if (value !== undefined) return { value };
  }

  return undefined;
}

function parseJsonCandidate(candidate: string): unknown | undefined {
  for (const variant of [candidate, repairMalformedJsonCandidate(candidate)]) {
    try {
      return JSON.parse(variant);
    } catch {
      // Try the repaired representation below.
    }
  }

  return undefined;
}

function repairMalformedJsonCandidate(candidate: string) {
  return candidate.replace(/:\s*(?=,|}|\])/g, ': null');
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

function normalizeAgentEventLevel(
  value: string | undefined,
  fallback: string,
): DashboardAgentEventLevel {
  const normalized = `${value ?? ''} ${fallback}`.toLowerCase();

  if (
    /\b(error|err|failed|failure|denied|exception|fatal|panic)\b/.test(
      normalized,
    )
  ) {
    return 'error';
  }
  if (/\b(warn|warning)\b/.test(normalized)) return 'warn';
  if (/\b(success|succeeded|started|stopped|notice)\b/.test(normalized)) {
    return 'notice';
  }
  if (/\b(debug|trace|verbose)\b/.test(normalized)) return 'debug';
  return 'info';
}

function resolveServerDisplayName(server: DTOs.MachineV1) {
  return (
    server.hostname ||
    server.domain ||
    server.address ||
    (server.id != null ? `#${server.id}` : 'Unknown server')
  );
}

function timestampMs(value?: string) {
  if (!value) return 0;
  const normalized = value.includes('/') ? value.replace(/\//g, '-') : value;
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stripAnsi(value: string) {
  return value.replace(ANSI_ESCAPE_PATTERN, '');
}

function redactSensitiveText(value: string) {
  return value
    .replace(
      /\b(password|passwd|token|secret|api[_-]?key|authorization|credential)(\s*[:=]\s*)([^\s'"`]+)/gi,
      '$1$2[redacted]',
    )
    .replace(/\b(bearer|basic)\s+[a-z0-9._~+/=-]+/gi, '$1 [redacted]');
}
