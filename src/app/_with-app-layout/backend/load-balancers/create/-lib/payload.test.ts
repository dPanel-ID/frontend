import { describe, expect, it } from 'vitest';

import { isHttpsRequested } from './payload';

describe('isHttpsRequested', () => {
  it('follows the switch on L7', () => {
    expect(
      isHttpsRequested({ lbKind: 'l7', features: { sslEnabled: true } }),
    ).toBe(true);
    expect(
      isHttpsRequested({ lbKind: 'l7', features: { sslEnabled: false } }),
    ).toBe(false);
  });

  it('defaults to on when the switch was never set', () => {
    expect(isHttpsRequested({ lbKind: 'l7' })).toBe(true);
  });

  // L4 passes traffic through untouched, whatever the switch still holds.
  it('is off on L4 even with the switch on', () => {
    expect(
      isHttpsRequested({ lbKind: 'l4', features: { sslEnabled: true } }),
    ).toBe(false);
  });
});
