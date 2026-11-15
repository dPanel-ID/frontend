import { describe, expect, it } from 'vitest';

import dictEn from '@/services/i18n/config/dict-en.json';
import dictId from '@/services/i18n/config/dict-id.json';

import { publicAuthErrorKey } from './public-auth-error';

describe('publicAuthErrorKey', () => {
  it.each([
    [
      'Wrong username or password. You can also sign in with your email address.',
      'loginInvalid',
    ],
    ['That username is already taken. Choose another one.', 'usernameTaken'],
    ['This email is already used by another account.', 'emailTaken'],
    [
      '  Signing in is not available right now. Try again in a minute. ',
      'authUnavailable',
    ],
  ])('maps %j to %s', (detail, key) => {
    expect(publicAuthErrorKey(detail)).toBe(key);
  });

  it.each([undefined, '', 'Something else went wrong', 'constructor'])(
    'leaves %j to be shown as sent',
    (detail) => {
      expect(publicAuthErrorKey(detail)).toBeUndefined();
    },
  );

  it('has an English and an Indonesian text for every key', () => {
    const keys = [
      'loginInvalid',
      'signUpConflict',
      'usernameTaken',
      'emailTaken',
      'authUnavailable',
      'signUpUnavailable',
    ];
    for (const dict of [dictEn, dictId]) {
      const entries = dict.toaster.authPublic as Record<string, string>;
      expect(Object.keys(entries).sort()).toEqual([...keys].sort());
      for (const key of keys) expect(entries[key]).toBeTruthy();
    }
  });
});
