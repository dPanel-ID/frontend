/** Clamps a usage value into 0–100, or undefined when it is not a number. */
export function sanitizePercent(value?: number) {
  if (value == null || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, value));
}

export function formatDecimal(value: number, precision: number) {
  const rounded = Number(value.toFixed(precision));
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(precision);
}

/** "1.5 GB" from a byte count; empty for missing or zero values. */
export function formatDataSize(value?: number) {
  if (value == null || !Number.isFinite(value) || value <= 0) return '';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let normalized = value;

  while (normalized >= 1024 && unitIndex < units.length - 1) {
    normalized /= 1024;
    unitIndex += 1;
  }

  return `${formatDecimal(normalized, normalized >= 10 ? 1 : 2)} ${
    units[unitIndex]
  }`;
}

/** "used / total" from the non-empty values. */
export function joinCompact(values: string[]) {
  const cleaned = values.filter(Boolean);
  if (cleaned.length === 0) return '';
  return cleaned.join(' / ');
}
