import { z } from 'zod';

export const roleSelectionSchema = z.object({
  roles: z.array(z.string()),
});

export type RoleSelection = z.infer<typeof roleSelectionSchema>;

export interface OrganizationMemberRolesModalProps {
  organizationId: string;
  memberId: string;
  memberName: string;
  initialRoleIds: string[];
  onSubmitSuccess?: () => void;
}
