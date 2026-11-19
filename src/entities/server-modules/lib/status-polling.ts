/**
 * Statuses a module installation leaves on its own when its job ends:
 * "installing" (and the older "progress") until the install job succeeds or
 * fails, "removing" until an uninstall finishes.
 */
const TRANSITIONAL_MODULE_STATUSES = new Set([
  'installing',
  'progress',
  'removing',
  'pending',
  'queued',
]);

/** How often a server's modules are read again while one is changing. */
export const MODULE_STATUS_POLL_MS = 5_000;

/** True while the installation's job can still change its status. */
export function isModuleStatusTransitional(status?: string | null) {
  return TRANSITIONAL_MODULE_STATUSES.has(
    String(status ?? '')
      .trim()
      .toLowerCase(),
  );
}

/**
 * The refresh interval for a server's module list: MODULE_STATUS_POLL_MS
 * while any installation is still changing, 0 (no polling) once every one
 * has settled. A module stayed "Installing" after its job succeeded until
 * the user pressed Refresh.
 */
export function moduleStatusPollMs(
  installations?: ReadonlyArray<{ status?: string | null }> | null,
) {
  return installations?.some((installation) =>
    isModuleStatusTransitional(installation.status),
  )
    ? MODULE_STATUS_POLL_MS
    : 0;
}
