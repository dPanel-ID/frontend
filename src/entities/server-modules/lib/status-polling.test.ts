import { describe, expect, it } from 'vitest';

import {
  MODULE_STATUS_POLL_MS,
  isModuleStatusTransitional,
  moduleStatusPollMs,
} from './status-polling';

describe('isModuleStatusTransitional', () => {
  it.each([
    ['installing', true],
    ['progress', true],
    ['removing', true],
    ['  Installing ', true],
    ['installed', false],
    ['failed', false],
    ['unknown', false],
    ['outdated', false],
    ['', false],
    [undefined, false],
    [null, false],
  ])('%s -> %s', (status, expected) => {
    expect(isModuleStatusTransitional(status)).toBe(expected);
  });
});

describe('moduleStatusPollMs', () => {
  it('polls while any installation is still changing', () => {
    expect(
      moduleStatusPollMs([{ status: 'installed' }, { status: 'installing' }]),
    ).toBe(MODULE_STATUS_POLL_MS);
  });

  it('stops once every installation has settled', () => {
    expect(
      moduleStatusPollMs([{ status: 'installed' }, { status: 'failed' }]),
    ).toBe(0);
  });

  it('does not poll without a list', () => {
    expect(moduleStatusPollMs(undefined)).toBe(0);
    expect(moduleStatusPollMs([])).toBe(0);
  });
});
