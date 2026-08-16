// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { assertMemberSelection } from './member-mutations';

describe('assertMemberSelection', () => {
  it('allows explicitly replacing members with an empty set', () => {
    expect(() => assertMemberSelection([], 'replace')).not.toThrow();
  });

  it('still rejects an empty add request', () => {
    expect(() => assertMemberSelection([], 'add')).toThrowError(
      'Select at least one server.',
    );
  });
});
