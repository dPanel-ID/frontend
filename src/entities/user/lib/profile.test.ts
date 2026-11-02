import { describe, expect, it } from 'vitest';

import { initialsOf, userProfilePath } from './profile';

describe('user profile helpers', () => {
  it('builds the profile path', () => {
    expect(userProfilePath('prakasa')).toBe('/u/prakasa');
    expect(userProfilePath('a b')).toBe('/u/a%20b');
  });

  it.each([
    ['Praksa Ant Lord', 'PL'],
    ['nickyrolly1', 'N'],
    ['jane.doe@example.com', 'JC'],
    ['', ''],
  ])('initials of %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});
