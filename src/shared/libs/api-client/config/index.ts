export const X_AUTH_ORGANIZATION_ID = 'x-auth-organization-id';

export const LS_ORGANIZATION_ID = 'organization_id';

export function normalizeWorkspaceOrganizationId(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('org-')) return value.slice(4);
  if (value.startsWith('org:')) return value.slice(4);
  return value;
}

/** Header value that selects the signed-in person's own workspace. */
export const PERSONAL_WORKSPACE_ID = 'personal';

/**
 * Headers that pin one request to a workspace: a team's group ID, or
 * `PERSONAL_WORKSPACE_ID` for the personal workspace.
 */
export function workspaceHeaders(workspaceId: string): Record<string, string> {
  return {
    [X_AUTH_ORGANIZATION_ID]:
      normalizeWorkspaceOrganizationId(workspaceId) || PERSONAL_WORKSPACE_ID,
  };
}
