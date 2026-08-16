import { describe, expect, it } from 'vitest';

import { isSemanticReleaseTag } from './validation';

describe('isSemanticReleaseTag', () => {
  it('accepts backend-compatible semantic release tags', () => {
    expect(isSemanticReleaseTag('v1.2.3')).toBe(true);
    expect(isSemanticReleaseTag('v1.2.3-beta.2')).toBe(true);
    expect(isSemanticReleaseTag('v1.2.3+build.4')).toBe(true);
  });

  it('rejects blank and malformed versions before confirmation', () => {
    expect(isSemanticReleaseTag('')).toBe(false);
    expect(isSemanticReleaseTag('1.2.3')).toBe(false);
    expect(isSemanticReleaseTag('v1.2')).toBe(false);
    expect(isSemanticReleaseTag('v1.2.3-01')).toBe(false);
    expect(isSemanticReleaseTag('v1.2.3/../../agent')).toBe(false);
  });
});
