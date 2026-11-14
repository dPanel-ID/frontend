/**
 * The sign-in and sign-up failures the API reports, keyed by their exact
 * English text (`internal/delivery/http/auth_public_errors.go` in the
 * backend). The API answers in English only, so the forms show the matching
 * dictionary entry under `toaster.authPublic` instead; any other text is
 * shown as the API sent it.
 */
const PUBLIC_AUTH_ERRORS = {
  'Wrong username or password. You can also sign in with your email address.':
    'loginInvalid',
  'An account with this email address or username already exists. Sign in instead, or choose another username.':
    'signUpConflict',
  'That username is already taken. Choose another one.': 'usernameTaken',
  'Signing in is not available right now. Try again in a minute.':
    'authUnavailable',
  'Creating an account is not available right now. Try again in a minute.':
    'signUpUnavailable',
} as const;

export type PublicAuthErrorKey =
  (typeof PUBLIC_AUTH_ERRORS)[keyof typeof PUBLIC_AUTH_ERRORS];

/** The dictionary key for a known API auth message, if it is one. */
export function publicAuthErrorKey(
  detail: string | undefined,
): PublicAuthErrorKey | undefined {
  if (!detail) return undefined;
  const text = detail.trim();
  return Object.hasOwn(PUBLIC_AUTH_ERRORS, text)
    ? PUBLIC_AUTH_ERRORS[text as keyof typeof PUBLIC_AUTH_ERRORS]
    : undefined;
}
