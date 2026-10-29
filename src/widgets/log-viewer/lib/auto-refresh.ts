/** How often a log view refreshes on its own; off unless the reader opts in. */
export const LOG_AUTO_REFRESH_OPTIONS = [
  { value: 'off', ms: null },
  { value: '30s', ms: 30_000 },
  { value: '1m', ms: 60_000 },
  { value: '5m', ms: 300_000 },
] as const;

export type LogAutoRefresh = (typeof LOG_AUTO_REFRESH_OPTIONS)[number]['value'];

export const DEFAULT_LOG_AUTO_REFRESH: LogAutoRefresh = 'off';

/** Milliseconds between refreshes, or null when auto-refresh is off. */
export function logAutoRefreshMs(value: LogAutoRefresh) {
  return (
    LOG_AUTO_REFRESH_OPTIONS.find((option) => option.value === value)?.ms ??
    null
  );
}
