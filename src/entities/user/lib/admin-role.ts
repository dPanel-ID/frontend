/** The Casdoor role that lets a person operate dPanel itself. */
export const DPANEL_ADMIN_ROLE = 'dpanel-admin';

/**
 * Whether the account roles name the dPanel administrator role. Casdoor
 * sends roles as "<organization>/<role>" (for example "dpanel/dpanel-admin"),
 * sometimes without the organization, so only the part after the last "/"
 * counts, compared case-insensitively. Workspace roles never match.
 *
 * This only decides what the UI shows; the API enforces the role itself.
 */
export function isDpanelAdmin(roles: readonly unknown[] | null | undefined) {
  if (!Array.isArray(roles)) return false;

  return roles.some((role) => {
    if (typeof role !== 'string') return false;

    const name = role.slice(role.lastIndexOf('/') + 1).trim();
    return name.toLowerCase() === DPANEL_ADMIN_ROLE;
  });
}
