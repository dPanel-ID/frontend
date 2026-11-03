import { describe, expect, it } from 'vitest';

import { matchesSearch } from './string';

describe('matchesSearch', () => {
  it('ignores letter case', () => {
    for (const query of ['dnoc', 'DNOC', 'dnoC', 'Worker']) {
      expect(matchesSearch('dnocs worker 01', query)).toBe(true);
    }
  });

  it('matches everything for an empty query', () => {
    expect(matchesSearch('anything', '')).toBe(true);
    expect(matchesSearch('anything', '   ')).toBe(true);
    expect(matchesSearch(undefined, undefined)).toBe(true);
  });

  it('rejects text without the query', () => {
    expect(matchesSearch('wordpress', 'dnoc')).toBe(false);
    expect(matchesSearch(null, 'dnoc')).toBe(false);
  });
});
