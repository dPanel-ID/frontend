/**
 * Query parameter the API adds to the return URL when a Google or GitHub
 * sign-in or link did not complete, e.g. `?auth_error=email_in_use`.
 */
export const AUTH_ERROR_PARAM = 'auth_error';

/** The codes the API sends, keyed to their `toaster.authRedirect` text. */
const AUTH_ERROR_KEYS = {
  signin_failed: 'signinFailed',
  email_in_use: 'emailInUse',
  email_required: 'emailRequired',
  github_linked_elsewhere: 'githubLinkedElsewhere',
  link_requires_session: 'linkRequiresSession',
  provider_not_available: 'providerNotAvailable',
} as const;

export type AuthRedirectErrorKey =
  (typeof AUTH_ERROR_KEYS)[keyof typeof AUTH_ERROR_KEYS];

/** Every dictionary key the codes map to, for the dictionary test. */
export const AUTH_REDIRECT_ERROR_KEYS = Object.values(
  AUTH_ERROR_KEYS,
) as AuthRedirectErrorKey[];

/**
 * The dictionary key for an `auth_error` code. Unknown codes read as a
 * failed sign-in, so text from the URL is never shown as it is.
 */
export function authRedirectErrorKey(
  code: string | null | undefined,
): AuthRedirectErrorKey | undefined {
  const value = code?.trim().toLowerCase();
  if (!value) return undefined;
  return Object.hasOwn(AUTH_ERROR_KEYS, value)
    ? AUTH_ERROR_KEYS[value as keyof typeof AUTH_ERROR_KEYS]
    : 'signinFailed';
}

/**
 * Splits a URL into the `auth_error` it carries and the same URL without it
 * (path, query and hash, ready for a history replace). Returns null when the
 * URL has no `auth_error`.
 */
export function takeAuthRedirectError(
  href: string,
): { key: AuthRedirectErrorKey; cleanHref: string } | null {
  let url: URL;
  try {
    url = new URL(href, 'http://localhost');
  } catch {
    return null;
  }
  if (!url.searchParams.has(AUTH_ERROR_PARAM)) return null;

  const key =
    authRedirectErrorKey(url.searchParams.get(AUTH_ERROR_PARAM)) ??
    'signinFailed';
  url.searchParams.delete(AUTH_ERROR_PARAM);

  return { key, cleanHref: `${url.pathname}${url.search}${url.hash}` };
}

/**
 * The login page URL for a signed-out visitor, keeping the `auth_error` the
 * API put on a protected page (e.g. `/dashboard?auth_error=signin_failed`)
 * so the login page can still explain what happened.
 */
export function loginPathKeepingAuthError(href: string): string {
  let code: string | null = null;
  try {
    code = new URL(href, 'http://localhost').searchParams.get(AUTH_ERROR_PARAM);
  } catch {
    code = null;
  }
  if (code == null) return '/';
  return `/?${new URLSearchParams({ [AUTH_ERROR_PARAM]: code }).toString()}`;
}
