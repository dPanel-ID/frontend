export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function formatPercent(value?: number) {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
}

export function sanitizePercent(value?: number) {
  if (value == null || Number.isNaN(value)) return undefined;
  return clampPercent(value);
}
