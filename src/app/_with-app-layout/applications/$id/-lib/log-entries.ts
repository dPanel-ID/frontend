import { parseLogLine } from '@/features/server-log-viewer-sidepanel/view';
import type {
  LogLevel,
  ParsedLogLine,
} from '@/features/server-log-viewer-sidepanel/view';

/** One log line as the logs API returns it. */
export interface LogEntryInput {
  line: string;
  severity?: string;
  /** Unix seconds/milliseconds/microseconds/nanoseconds, or an ISO date. */
  time?: string;
  /** Where the line came from, e.g. the host that wrote it. */
  source?: string;
}

/** Most severe first; also the order the level filters are shown in. */
export const LOG_LEVEL_ORDER: LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'notice',
  'info',
  'debug',
];

const SEVERITY_LEVELS: Record<string, LogLevel> = {
  trace: 'debug',
  debug: 'debug',
  info: 'info',
  informational: 'info',
  notice: 'notice',
  warn: 'warn',
  warning: 'warn',
  err: 'error',
  error: 'error',
  crit: 'fatal',
  critical: 'fatal',
  alert: 'fatal',
  emerg: 'fatal',
  emergency: 'fatal',
  fatal: 'fatal',
  panic: 'fatal',
};

// Go's log package prefixes "2026/10/29 18:42:56"; the entry time already
// says when, so the prefix is dropped from what is shown.
const GO_LOG_TIMESTAMP = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?\s*/;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Reads an API entry time into epoch milliseconds. */
export function parseLogEntryTime(value: string | undefined) {
  if (!value) return undefined;

  const numeric = Number(value);
  if (Number.isFinite(numeric) && value.trim() !== '') {
    if (numeric > 1e17) return numeric / 1e6;
    if (numeric > 1e14) return numeric / 1e3;
    if (numeric > 1e11) return numeric;
    return numeric * 1000;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * A local time an operator reads at a glance: "Today 18:42:56",
 * "Yesterday 09:15:02" or "Oct 27, 14:03:11".
 */
export function formatLogTime(ms: number, nowMs: number, locale: string) {
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(ms);
  const dayDiff = Math.round((startOfDay(nowMs) - startOfDay(ms)) / DAY_MS);

  if (dayDiff === 0 || dayDiff === 1) {
    const day = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
      -dayDiff,
      'day',
    );
    return `${day.charAt(0).toLocaleUpperCase(locale)}${day.slice(1)} ${time}`;
  }

  const date = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(new Date(ms).getFullYear() !== new Date(nowMs).getFullYear() && {
      year: 'numeric',
    }),
  }).format(ms);

  return `${date}, ${time}`;
}

/** Turns API entries into the rows the server log viewer renders. */
export function toParsedLogLines(
  entries: LogEntryInput[],
  options: {
    fallbackSource: string;
    locale: string;
    nowMs: number;
    /** Lines before this page, so row numbers match the page's line range. */
    lineOffset?: number;
  },
): ParsedLogLine[] {
  const { fallbackSource, lineOffset = 0, locale, nowMs } = options;
  const occurrences = new Map<string, number>();

  return entries.map((entry, index) => {
    const timeMs = parseLogEntryTime(entry.time);
    const line =
      timeMs === undefined
        ? entry.line
        : entry.line.replace(GO_LOG_TIMESTAMP, '');
    const parsed = parseLogLine(line, index, undefined);
    const level = moreSevere(levelFromSeverity(entry.severity), parsed.level);
    const timestamp =
      timeMs === undefined
        ? parsed.timestamp
        : formatLogTime(timeMs, nowMs, locale);
    const source = entry.source?.trim() || fallbackSource;

    // Identical lines can share a timestamp, so count repeats to keep ids
    // unique and stable across refreshes (expanded rows stay expanded).
    const baseId = `${entry.time ?? ''}|${entry.line}`;
    const seen = occurrences.get(baseId) ?? 0;
    occurrences.set(baseId, seen + 1);

    return {
      ...parsed,
      id: `${baseId}|${seen}`,
      lineNumber: lineOffset + index + 1,
      raw: entry.line,
      level,
      timestamp,
      sourceLabel: source,
      searchText: `${parsed.searchText} ${timestamp ?? ''} ${source}`,
    };
  });
}

/** How many lines each level has, for the level filter. */
export function countLogLevels(lines: ParsedLogLine[]) {
  const counts = new Map<LogLevel, number>();
  for (const line of lines) {
    counts.set(line.level, (counts.get(line.level) ?? 0) + 1);
  }
  return counts;
}

function levelFromSeverity(value: string | undefined) {
  if (!value) return undefined;
  return SEVERITY_LEVELS[value.trim().toLowerCase()];
}

// Agents often stamp every line INFO, so a line whose text reads as an error
// keeps the more severe level.
function moreSevere(a: LogLevel | undefined, b: LogLevel): LogLevel {
  if (!a) return b;
  return LOG_LEVEL_ORDER.indexOf(a) <= LOG_LEVEL_ORDER.indexOf(b) ? a : b;
}

function startOfDay(ms: number) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
