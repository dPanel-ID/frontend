export interface MemberDeletePayload {
  id: string;
  name: string;
}

export interface MemberManageRolesPayload {
  id: string;
  name: string;
  roleIds: string[];
}

export interface OrgEditPayload {
  orgId: string;
  name: string;
  description?: string;
}
