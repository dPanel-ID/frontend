import type { TeamAccess } from '../../-lib/team-roles';

/** One team as the list shows it. */
export interface TeamRow {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  /** The signed-in user's access; undefined when the profile has not loaded. */
  access?: TeamAccess;
  /** Whether this is the workspace the session is acting in. */
  isActive: boolean;
}
