/**
 * The names the API accepts for an application: words of letters and digits,
 * separated by spaces. It mirrors the backend's `applicationNamePattern`, so
 * the form can say what is wrong before the API refuses the whole payload.
 */
const APPLICATION_NAME_PATTERN = /^[A-Za-z0-9]+(?: +[A-Za-z0-9]+)*$/;

/** Whether the API will accept this application name. */
export function isValidApplicationName(name: string): boolean {
  return APPLICATION_NAME_PATTERN.test(name.trim());
}
