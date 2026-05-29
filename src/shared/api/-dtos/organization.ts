import type { User } from '.';

export interface OrganizationV1 {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  error?: string;
  user_id?: string;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationRoleV1 {
  id?: string;
  name?: string;
  description?: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationPeopleV1 {
  id?: string;
  organization_id?: string;
  organization?: OrganizationV1;
  user_id?: string;
  user?: User;
  role_id?: string;
  role?: OrganizationRoleV1;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationConfigV1 {
  id?: string;
  key?: string;
  value?: string;
  is_public?: boolean;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function organizationToWorkspaceId(organizationId?: string | null) {
  return workspaceToOrganizationId(organizationId);
}

export function workspaceToOrganizationId(workspaceId?: string | null) {
  if (!workspaceId) return '';
  if (workspaceId.startsWith('org-')) return workspaceId.slice(4);
  if (workspaceId.startsWith('org:')) return workspaceId.slice(4);
  return workspaceId;
}
