const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** How far back runtime logs can be queried. The API enforces the same cap. */
export const LOG_TIME_RANGE_MAX_LOOKBACK_DAYS = 3;
export const LOG_TIME_RANGE_MAX_LOOKBACK_MS =
  LOG_TIME_RANGE_MAX_LOOKBACK_DAYS * DAY_MS;

/** Lines per page in the viewer; older lines are a page away. */
export const LOG_PAGE_SIZE = 200;

export const LOG_TIME_RANGE_PRESETS = {
  '10m': { durationMs: 10 * MINUTE_MS },
  '1h': { durationMs: HOUR_MS },
  '6h': { durationMs: 6 * HOUR_MS },
  '24h': { durationMs: DAY_MS },
  '3d': { durationMs: 3 * DAY_MS },
} satisfies Record<string, { durationMs: number }>;

export type LogTimeRangePreset = keyof typeof LOG_TIME_RANGE_PRESETS;

export const LOG_TIME_RANGE_PRESET_ORDER = Object.keys(
  LOG_TIME_RANGE_PRESETS,
) as LogTimeRangePreset[];

export type LogTimeRange =
  | { kind: 'relative'; preset: LogTimeRangePreset }
  | { kind: 'absolute'; fromMs: number; toMs: number };

export const DEFAULT_LOG_TIME_RANGE: LogTimeRange = {
  kind: 'relative',
  preset: '10m',
};

export interface ResolvedLogTimeRange {
  timeGte: string;
  timeLt: string;
  limit: number;
}

/** Turns a range into the bounds and page size sent to the logs API. */
export function resolveLogTimeRange(
  range: LogTimeRange,
  anchorMs: number,
): ResolvedLogTimeRange {
  if (range.kind === 'absolute') {
    return {
      timeGte: new Date(range.fromMs).toISOString(),
      timeLt: new Date(range.toMs).toISOString(),
      limit: LOG_PAGE_SIZE,
    };
  }

  const preset = LOG_TIME_RANGE_PRESETS[range.preset];

  return {
    timeGte: new Date(anchorMs - preset.durationMs).toISOString(),
    timeLt: new Date(anchorMs).toISOString(),
    limit: LOG_PAGE_SIZE,
  };
}

/** A stable identity for a range, e.g. to reset scroll when it changes. */
export function logTimeRangeKey(range: LogTimeRange) {
  return range.kind === 'relative'
    ? range.preset
    : `${range.fromMs}-${range.toMs}`;
}

export type CustomLogTimeRangeError =
  | 'invalid'
  | 'startAfterEnd'
  | 'tooOld'
  | 'inFuture';

/**
 * Checks a custom range picked in the browser. The start may not reach past
 * the lookback window and the end may not be in the future.
 */
export function validateCustomLogTimeRange(
  fromMs: number,
  toMs: number,
  nowMs: number,
): CustomLogTimeRangeError | null {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return 'invalid';
  if (fromMs >= toMs) return 'startAfterEnd';
  // Minute-precision inputs round the window edge down, so allow one minute.
  if (fromMs < nowMs - LOG_TIME_RANGE_MAX_LOOKBACK_MS - MINUTE_MS) {
    return 'tooOld';
  }
  if (toMs > nowMs + MINUTE_MS) return 'inFuture';
  return null;
}

/** Formats a timestamp for an `<input type="datetime-local">` in local time. */
export function toDateTimeLocalValue(ms: number) {
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Reads a `datetime-local` value as local time; NaN when empty or invalid. */
export function fromDateTimeLocalValue(value: string) {
  if (!value) return Number.NaN;
  return new Date(value).getTime();
}

/** "GMT+4" style label for the browser's offset at the given moment. */
export function formatUtcOffset(ms: number) {
  const offsetMinutes = -new Date(ms).getTimezoneOffset();
  const sign = offsetMinutes < 0 ? '-' : '+';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;

  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`;
}
