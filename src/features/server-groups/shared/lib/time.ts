/**
 * An operation timestamp as people read it, in their locale and time zone,
 * like the rest of the app; "-" when the API sent none or an unreadable one.
 */
export function formatOperationTime(
  value: string | null | undefined,
  locale: string,
) {
  if (!value) return '-';
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return '-';
  return time.toLocaleString(locale);
}
