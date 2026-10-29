import { describe, expect, it } from 'vitest';

import {
  countLogLevels,
  formatLogTime,
  parseLogEntryTime,
  toParsedLogLines,
} from './log-entries';

const NOW = new Date(2026, 9, 29, 20, 30, 0).getTime();
const OPTIONS = {
  fallbackSource: 'pubsub-consumer',
  locale: 'en-US',
  nowMs: NOW,
};

describe('parseLogEntryTime', () => {
  it.each([
    ['1793280019429.226', 1793280019429.226],
    ['1793280019', 1793280019000],
    ['1793280019429226', 1793280019429.226],
    ['1793280019429226000', 1793280019429.226],
    ['2026-10-29T16:20:19.000Z', Date.UTC(2026, 9, 29, 16, 20, 19)],
  ])('reads %s', (value, expected) => {
    expect(parseLogEntryTime(value)).toBeCloseTo(expected, 0);
  });

  it.each([undefined, '', 'soon'])('ignores %o', (value) => {
    expect(parseLogEntryTime(value)).toBeUndefined();
  });
});

describe('formatLogTime', () => {
  it('names today and yesterday', () => {
    expect(
      formatLogTime(new Date(2026, 9, 29, 20, 20, 19).getTime(), NOW, 'en-US'),
    ).toBe('Today 20:20:19');
    expect(
      formatLogTime(new Date(2026, 9, 28, 9, 5, 2).getTime(), NOW, 'en-US'),
    ).toBe('Yesterday 09:05:02');
  });

  it('shows the date for older lines and the year across years', () => {
    expect(
      formatLogTime(new Date(2026, 9, 25, 14, 3, 11).getTime(), NOW, 'en-US'),
    ).toBe('Oct 25, 14:03:11');
    expect(
      formatLogTime(new Date(2025, 11, 31, 23, 0, 0).getTime(), NOW, 'en-US'),
    ).toBe('Dec 31, 2025, 23:00:00');
  });
});

describe('toParsedLogLines', () => {
  const at = String(new Date(2026, 9, 29, 20, 20, 19).getTime());

  it('pulls the message out of a JSON payload and drops the Go timestamp', () => {
    const [line] = toParsedLogLines(
      [
        {
          line: '2026/10/29 20:20:19 [postRequestForm] Response from API: {"ok":1,"message":"Pembayaran Berhasil Diterima"}',
          severity: 'INFO',
          time: at,
          source: 'bbo-pubsub-consumer-01',
        },
      ],
      OPTIONS,
    );

    expect(line?.message).toBe('Pembayaran Berhasil Diterima');
    expect(line?.jsonPayload).toEqual({
      ok: 1,
      message: 'Pembayaran Berhasil Diterima',
    });
    expect(line?.jsonPrefix).toBe('[postRequestForm] Response from API:');
    expect(line?.timestamp).toBe('Today 20:20:19');
    expect(line?.level).toBe('info');
    expect(line?.sourceLabel).toBe('bbo-pubsub-consumer-01');
    expect(line?.raw).toContain('2026/10/29 20:20:19');
  });

  it('keeps the more severe of the stamped severity and the text', () => {
    const [stampedInfo, stampedError] = toParsedLogLines(
      [
        {
          line: 'payment failed with error: timeout',
          severity: 'INFO',
          time: at,
        },
        { line: 'worker stopped', severity: 'ERR', time: at },
      ],
      OPTIONS,
    );

    expect(stampedInfo?.level).toBe('error');
    expect(stampedError?.level).toBe('error');
  });

  it('falls back to the given source and keeps repeated lines distinct', () => {
    const lines = toParsedLogLines(
      [
        { line: 'Print Response Status: 200 OK', time: at },
        { line: 'Print Response Status: 200 OK', time: at },
      ],
      OPTIONS,
    );

    expect(lines.map((line) => line.sourceLabel)).toEqual([
      'pubsub-consumer',
      'pubsub-consumer',
    ]);
    expect(new Set(lines.map((line) => line.id)).size).toBe(2);
  });

  it('counts lines per level', () => {
    const counts = countLogLevels(
      toParsedLogLines(
        [
          { line: 'ok', severity: 'info' },
          { line: 'disk almost full', severity: 'warning' },
          { line: 'ok again', severity: 'info' },
        ],
        OPTIONS,
      ),
    );

    expect(Object.fromEntries(counts)).toEqual({ info: 2, warn: 1 });
  });
});
