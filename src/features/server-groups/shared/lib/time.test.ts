import { describe, expect, it } from 'vitest';

import { formatOperationTime } from './time';

describe('formatOperationTime', () => {
  it('formats an ISO time in the reader locale', () => {
    const iso = '2026-11-14T08:30:00Z';
    expect(formatOperationTime(iso, 'en')).toBe(
      new Date(iso).toLocaleString('en'),
    );
    expect(formatOperationTime(iso, 'en')).not.toContain('T08:30');
  });

  it.each([undefined, null, '', 'not a time'])(
    'shows a dash for %s',
    (value) => {
      expect(formatOperationTime(value, 'en')).toBe('-');
    },
  );
});
