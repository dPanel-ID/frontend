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

/** Same for KEY=VALUE lines, as the application update page edits them. */
export function revealMaskedEnvText(
  text: string,
  revealed: Array<{ key: string; value: string }>,
) {
  const values = new Map(revealed.map((item) => [item.key, item.value]));
  return text
    .split('\n')
    .map((line) => {
      const separator = line.indexOf('=');
      if (separator <= 0) return line;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1);
      return isMaskedValue(value.trim()) && values.has(key)
        ? `${line.slice(0, separator)}=${values.get(key)}`
        : line;
    })
    .join('\n');
}
