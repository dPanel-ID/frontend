export const X_AUTH_ORGANIZATION_ID = 'x-auth-organization-id';

export const LS_ORGANIZATION_ID = 'organization_id';

export function normalizeWorkspaceOrganizationId(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('org-')) return value;
  if (value.startsWith('org:')) return `org-${value.slice(4)}`;
  return `org-${value}`;
}
