import { describe, expect, it } from 'vitest';

import { toBranchChoices } from './git-branches';

describe('toBranchChoices', () => {
  it('reads a successful response, which is the array itself', () => {
    const response = Object.assign(
      [
        { name: 'dev', commit: { sha: 'aaa' } },
        { name: 'main', commit: { sha: 'bbb' } },
      ],
      { $status: 'success' },
    );

    expect(toBranchChoices(response)).toEqual([
      { name: 'dev', commitHead: 'aaa' },
      { name: 'main', commitHead: 'bbb' },
    ]);
  });

  // The crash this function exists to prevent: the query is skipped until a
  // repository is chosen, so the first render sees `initial`, which is a
  // plain object and has no array methods.
  it('returns null for an initial response instead of throwing', () => {
    expect(() => toBranchChoices({ $status: 'initial' })).not.toThrow();
    expect(toBranchChoices({ $status: 'initial' })).toBeNull();
  });

  it('returns null for a failed response', () => {
    expect(toBranchChoices({ $status: 'failed', kind: 'api' })).toBeNull();
  });

  it('returns null while loading with nothing cached', () => {
    expect(toBranchChoices({ $status: 'loading' })).toBeNull();
  });

  it('keeps showing the previous list while reloading', () => {
    const prevData = Object.assign([{ name: 'dev', commit: { sha: 'aaa' } }], {
      $status: 'success',
    });

    expect(toBranchChoices({ $status: 'loading', prevData })).toEqual([
      { name: 'dev', commitHead: 'aaa' },
    ]);
  });

  it('skips branches with no name or no commit', () => {
    const response = Object.assign(
      [
        { name: 'dev', commit: { sha: 'aaa' } },
        { name: '', commit: { sha: 'bbb' } },
        { name: 'no-commit' },
        { commit: { sha: 'ccc' } },
        null,
      ],
      { $status: 'success' },
    );

    expect(toBranchChoices(response)).toEqual([
      { name: 'dev', commitHead: 'aaa' },
    ]);
  });

  it('survives junk', () => {
    expect(toBranchChoices(undefined)).toBeNull();
    expect(toBranchChoices(null)).toBeNull();
    expect(toBranchChoices('nope')).toBeNull();
  });
});
