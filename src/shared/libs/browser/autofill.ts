/**
 * Attributes that tell password managers (1Password, LastPass, Bitwarden,
 * Dashlane) a field is not part of a login form.
 */
const PASSWORD_MANAGER_IGNORE = {
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
} as const;

/**
 * For a plain text field that is not a login name, such as a domain or a
 * connection name. Spread onto the field.
 *
 * Chrome ignores autocomplete="off" for a text field that sits before a
 * password field: it takes the pair for a login and fills a saved user name
 * and password. Pair this with secretFieldAutofillProps on the secret field.
 */
export const plainFieldAutofillProps = {
  autoComplete: 'off',
  ...PASSWORD_MANAGER_IGNORE,
} as const;

/**
 * For a masked field that holds an API token, key or a new password, never
 * a saved login password. Spread onto the field.
 *
 * autocomplete="new-password" is the value browsers honour on a password
 * field: they fill no saved password there, nor the field before it as its
 * user name. A domain form once received "dpanel01" and a saved password
 * from Chrome this way.
 */
export const secretFieldAutofillProps = {
  autoComplete: 'new-password',
  ...PASSWORD_MANAGER_IGNORE,
} as const;
