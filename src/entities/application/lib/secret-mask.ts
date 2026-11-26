import { mapEnvTextValues, parseEnvText } from './env-text';

/**
 * The API masks every build and runtime variable value with this text.
 * Sending it back unchanged keeps the stored value; the real values are
 * read with the reveal call (ApiApplication.EnvironmentReveal).
 */
export const SECRET_MASK = '••••••••';

export function isMaskedValue(value: string | null | undefined) {
  return value === SECRET_MASK;
}

/**
 * Fills masked values from revealed ones, leaving every value the person
 * already typed as it is.
 */
export function revealMaskedValues<
  T extends { key: string; value?: string | null },
>(variables: T[], revealed: Array<{ key: string; value: string }>): T[] {
  const values = new Map(revealed.map((item) => [item.key, item.value]));
  return variables.map((variable) =>
    isMaskedValue(variable.value) && values.has(variable.key)
      ? { ...variable, value: values.get(variable.key) }
      : variable,
  );
}

/**
 * Same for environment text (see env-text.ts): only the value of a masked
 * line changes; comments, spacing and every other line stay as written.
 */
export function revealMaskedEnvText(
  text: string,
  revealed: Array<{ key: string; value: string }>,
) {
  const values = new Map(revealed.map((item) => [item.key, item.value]));
  return mapEnvTextValues(text, (entry) =>
    isMaskedValue(entry.value) ? values.get(entry.key) : undefined,
  );
}

/**
 * Puts the mask back on every value still equal to its revealed value, so
 * values can be hidden again. Values the person changed stay as typed.
 */
export function hideRevealedValues<
  T extends { key: string; value?: string | null },
>(variables: T[], revealed: Array<{ key: string; value: string }>): T[] {
  const values = new Map(revealed.map((item) => [item.key, item.value]));
  return variables.map((variable) =>
    variable.value && values.get(variable.key) === variable.value
      ? { ...variable, value: SECRET_MASK }
      : variable,
  );
}

/** Same for environment text. */
export function hideRevealedEnvText(
  text: string,
  revealed: Array<{ key: string; value: string }>,
) {
  const values = new Map(revealed.map((item) => [item.key, item.value]));
  return mapEnvTextValues(text, (entry) =>
    entry.value && values.get(entry.key) === entry.value
      ? SECRET_MASK
      : undefined,
  );
}

/** Whether any variable in environment text still holds the mask. */
export function hasMaskedEnvText(text: string) {
  return (
    text.includes(SECRET_MASK) &&
    parseEnvText(text).variables.some((variable) =>
      isMaskedValue(variable.value),
    )
  );
}
