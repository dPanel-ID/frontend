import { describe, expect, it } from 'vitest';

import dictEn from '@/services/i18n/config/dict-en.json';
import dictId from '@/services/i18n/config/dict-id.json';

import {
  AUTH_REDIRECT_ERROR_KEYS,
  authRedirectErrorKey,
  loginPathKeepingAuthError,
  takeAuthRedirectError,
} from './oauth-auth-error';

describe('authRedirectErrorKey', () => {
  it.each([
    ['signin_failed', 'signinFailed'],
    ['email_in_use', 'emailInUse'],
    ['email_required', 'emailRequired'],
    ['github_linked_elsewhere', 'githubLinkedElsewhere'],
    ['link_requires_session', 'linkRequiresSession'],
    ['provider_not_available', 'providerNotAvailable'],
    [' EMAIL_IN_USE ', 'emailInUse'],
  ])('maps %j to %s', (code, key) => {
    expect(authRedirectErrorKey(code)).toBe(key);
  });

  it.each(['something_new', 'constructor', '<script>alert(1)</script>'])(
    'reads unknown code %j as a failed sign-in',
    (code) => {
      expect(authRedirectErrorKey(code)).toBe('signinFailed');
    },
  );

  it.each([undefined, null, '', '   '])('ignores %j', (code) => {
    expect(authRedirectErrorKey(code)).toBeUndefined();
  });
});

describe('takeAuthRedirectError', () => {
  it('returns the key and the URL without auth_error', () => {
    expect(
      takeAuthRedirectError(
        'https://dnocs.devetek.app/profile?tab=profile&auth_error=github_linked_elsewhere#top',
      ),
    ).toEqual({
      key: 'githubLinkedElsewhere',
      cleanHref: '/profile?tab=profile#top',
    });
  });

  it('keeps other parameters, such as the sign-in return URL', () => {
    expect(
      takeAuthRedirectError(
        '/?redirect=https%3A%2F%2Fdbmanager.devetek.app%2F&auth_error=email_in_use',
      ),
    ).toEqual({
      key: 'emailInUse',
      cleanHref: '/?redirect=https%3A%2F%2Fdbmanager.devetek.app%2F',
    });
  });

  it('treats an empty auth_error as a failed sign-in', () => {
    expect(takeAuthRedirectError('/?auth_error=')).toEqual({
      key: 'signinFailed',
      cleanHref: '/',
    });
  });

  it('returns null without auth_error', () => {
    expect(takeAuthRedirectError('/profile?tab=profile')).toBeNull();
  });

  it('has an English and an Indonesian text for every key', () => {
    for (const dict of [dictEn, dictId]) {
      const entries = dict.toaster.authRedirect as Record<string, string>;
      expect(Object.keys(entries).sort()).toEqual(
        [...AUTH_REDIRECT_ERROR_KEYS].sort(),
      );
      for (const key of AUTH_REDIRECT_ERROR_KEYS) {
        expect(entries[key]).toBeTruthy();
      }
    }
  });
});

describe('loginPathKeepingAuthError', () => {
  it('carries auth_error to the login page', () => {
    expect(
      loginPathKeepingAuthError(
        'https://dnocs.devetek.app/dashboard?tab=x&auth_error=signin_failed',
      ),
    ).toBe('/?auth_error=signin_failed');
  });

  it('encodes the code it carries', () => {
    expect(loginPathKeepingAuthError('/profile?auth_error=a%26b%3Dc')).toBe(
      '/?auth_error=a%26b%3Dc',
    );
  });

  it('goes to the plain login page without auth_error', () => {
    expect(loginPathKeepingAuthError('/dashboard?tab=x')).toBe('/');
  });
});
