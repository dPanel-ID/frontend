import { describe, expect, it } from 'vitest';

import { DEFAULT_LOG_AUTO_REFRESH, logAutoRefreshMs } from './auto-refresh';

describe('logAutoRefreshMs', () => {
  it.each([
    ['off', null],
    ['30s', 30_000],
    ['1m', 60_000],
    ['5m', 300_000],
  ] as const)('%s → %s', (value, ms) => {
    expect(logAutoRefreshMs(value)).toBe(ms);
  });

  it('is off by default', () => {
    expect(logAutoRefreshMs(DEFAULT_LOG_AUTO_REFRESH)).toBeNull();
  });
});
