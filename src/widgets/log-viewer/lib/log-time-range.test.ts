import { describe, expect, it } from 'vitest';

import {
  LOG_TIME_RANGE_MAX_LOOKBACK_MS,
  fromDateTimeLocalValue,
  logTimeRangeKey,
  resolveLogTimeRange,
  toDateTimeLocalValue,
  validateCustomLogTimeRange,
} from './log-time-range';

const NOW = Date.UTC(2026, 9, 29, 12, 0, 0);
const HOUR = 60 * 60 * 1000;

describe('resolveLogTimeRange', () => {
  it('ends a preset at the anchor and reaches back its duration', () => {
    expect(
      resolveLogTimeRange({ kind: 'relative', preset: '24h' }, NOW),
    ).toEqual({
      timeGte: '2026-10-28T12:00:00.000Z',
      timeLt: '2026-10-29T12:00:00.000Z',
      limit: 200,
    });
  });

  it('reaches back the full lookback window for the widest preset', () => {
    const range = resolveLogTimeRange({ kind: 'relative', preset: '10d' }, NOW);

    expect(Date.parse(range.timeGte)).toBe(
      NOW - LOG_TIME_RANGE_MAX_LOOKBACK_MS,
    );
    expect(range.limit).toBe(200);
  });

  it('keeps a custom range fixed whatever the anchor', () => {
    const range = {
      kind: 'absolute',
      fromMs: NOW - 3 * HOUR,
      toMs: NOW - HOUR,
    } as const;

    expect(resolveLogTimeRange(range, NOW + 5 * HOUR)).toEqual({
      timeGte: '2026-10-29T09:00:00.000Z',
      timeLt: '2026-10-29T11:00:00.000Z',
      limit: 200,
    });
  });
});

describe('validateCustomLogTimeRange', () => {
  it.each([
    ['a range inside the window', NOW - 2 * HOUR, NOW - HOUR, null],
    ['the full window', NOW - LOG_TIME_RANGE_MAX_LOOKBACK_MS, NOW, null],
    ['a missing value', Number.NaN, NOW, 'invalid'],
    ['a start after the end', NOW - HOUR, NOW - 2 * HOUR, 'startAfterEnd'],
    ['an empty range', NOW - HOUR, NOW - HOUR, 'startAfterEnd'],
    [
      'a start past the window',
      NOW - LOG_TIME_RANGE_MAX_LOOKBACK_MS - 2 * HOUR,
      NOW,
      'tooOld',
    ],
    ['an end in the future', NOW - HOUR, NOW + 2 * HOUR, 'inFuture'],
  ])('rejects or accepts %s', (_, fromMs, toMs, expected) => {
    expect(validateCustomLogTimeRange(fromMs, toMs, NOW)).toBe(expected);
  });
});

describe('datetime-local values', () => {
  it('round-trips a minute-precision local time', () => {
    const ms = new Date(2026, 9, 20, 14, 5).getTime();

    expect(toDateTimeLocalValue(ms)).toBe('2026-10-20T14:05');
    expect(fromDateTimeLocalValue('2026-10-20T14:05')).toBe(ms);
  });

  it('reads an empty value as invalid', () => {
    expect(fromDateTimeLocalValue('')).toBeNaN();
  });
});

describe('logTimeRangeKey', () => {
  it('distinguishes presets and custom ranges', () => {
    expect(logTimeRangeKey({ kind: 'relative', preset: '7d' })).toBe('7d');
    expect(logTimeRangeKey({ kind: 'absolute', fromMs: 1, toMs: 2 })).toBe(
      '1-2',
    );
  });
});
