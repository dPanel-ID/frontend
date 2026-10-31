import type { TeamAccess } from '../../../-lib/team-roles';

/** One member as the panel shows them. */
export interface MemberRow {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  access: TeamAccess;
  /** Every role name, for the badges. */
  roleLabels: string[];
  /** Every role id, for the role editor. */
  roleIds: string[];
  joinedAt?: string;
}
