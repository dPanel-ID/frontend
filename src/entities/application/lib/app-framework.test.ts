import { describe, expect, it } from 'vitest';

import { isLaravelFramework, knownFramework } from './app-framework';

describe('knownFramework', () => {
  it('takes the first identified framework', () => {
    expect(knownFramework('', 'unknown', 'Laravel')).toBe('laravel');
    expect(knownFramework('nextjs', 'laravel')).toBe('nextjs');
    expect(knownFramework(undefined, null, 'unknown')).toBe('');
  });
});

describe('isLaravelFramework', () => {
  it('is true only for an application identified as Laravel', () => {
    expect(isLaravelFramework('laravel')).toBe(true);
    expect(isLaravelFramework(undefined, 'laravel')).toBe(true);
    expect(isLaravelFramework('unknown')).toBe(false);
    expect(isLaravelFramework('')).toBe(false);
  });
});
