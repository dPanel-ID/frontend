/**
 * Whether "Migrate Ownership" is offered. It is hidden in every module: once
 * a resource is in a workspace it stays there, and the API refuses to move it
 * (see docs/features/README.md in the backend repo). The modal stays registered so the rule can
 * be revisited without rebuilding it.
 */
export function isMigrateOwnershipVisible(): boolean {
  return false;
}
