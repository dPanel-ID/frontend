/** How much a person can do in a team, most powerful first. */
export type TeamAccess = 'owner' | 'admin' | 'member';

const OWNER_ROLE_KEYS = ['owner'];
const ADMIN_ROLE_KEYS = ['admin', 'administrator', 'owner'];

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? '';
}

// Roles arrive as bare ids ("owner"), scoped ids ("2430…:owner") or prefixed
// names ("acme-role-admin"), so match on the trailing key.
function roleMatches(role: string, roleKeys: string[]) {
  return roleKeys.some(
    (roleKey) =>
      role === roleKey ||
      role.endsWith(`-${roleKey}`) ||
      role.endsWith(`:${roleKey}`) ||
      role.endsWith(`-role-${roleKey}`) ||
      role.endsWith(`/${roleKey}`),
  );
}

export function isOwnerRole(role?: string | null) {
  const normalized = normalizeRole(role);
  return Boolean(normalized) && roleMatches(normalized, OWNER_ROLE_KEYS);
}

export function isAdminRole(role?: string | null) {
  const normalized = normalizeRole(role);
  return Boolean(normalized) && roleMatches(normalized, ADMIN_ROLE_KEYS);
}

/** The strongest access any of these roles grants. */
export function teamAccessOf(
  roles: Array<string | null | undefined>,
): TeamAccess {
  if (roles.some(isOwnerRole)) return 'owner';
  if (roles.some(isAdminRole)) return 'admin';
  return 'member';
}

export interface ProfileWorkspace {
  id: string;
  type: string;
  name: string;
  roles?: string[];
}

/** The teams the signed-in user belongs to; the personal workspace is not one. */
export function teamWorkspaces(workspaces: ProfileWorkspace[] | undefined) {
  return (workspaces ?? []).filter((workspace) => workspace.type === 'group');
}

/** The signed-in user's access in a team, or undefined if not a member. */
export function myTeamAccess(
  workspaces: ProfileWorkspace[] | undefined,
  teamId: string,
): TeamAccess | undefined {
  const workspace = teamWorkspaces(workspaces).find(
    (item) => item.id === teamId,
  );
  if (!workspace) return undefined;
  return teamAccessOf(workspace.roles ?? []);
}
