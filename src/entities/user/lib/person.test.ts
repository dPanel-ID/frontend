import { describe, expect, it } from 'vitest';

import { personOf } from './person';

describe('personOf', () => {
  it('uses the display name and links by username', () => {
    expect(
      personOf({
        fullname: 'Amrih Prakasa',
        username: 'prakasa',
        avatar_url: 'https://cdn.example/a.png',
      }),
    ).toEqual({
      name: 'Amrih Prakasa',
      username: 'prakasa',
      avatarUrl: 'https://cdn.example/a.png',
    });
  });

  it('falls back to the username', () => {
    expect(personOf({ fullname: ' ', username: 'nickyrolly1' })).toEqual({
      name: 'nickyrolly1',
      username: 'nickyrolly1',
      avatarUrl: undefined,
    });
  });

  it('never names someone by email', () => {
    const user = { email: 'ops@example.com' } as Parameters<typeof personOf>[0];
    expect(personOf(user)).toBeUndefined();
  });

  it('is absent when the API could not resolve anyone', () => {
    expect(personOf(undefined)).toBeUndefined();
    expect(personOf(null)).toBeUndefined();
    expect(personOf({})).toBeUndefined();
  });
});
