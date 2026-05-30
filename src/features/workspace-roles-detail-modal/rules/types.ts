import { z } from 'zod';

export const workspaceRolesDetailSchema = z.object({
  workspaceName: z.string(),
  roles: z.array(z.string()),
});

export type WorkspaceRolesDetail = z.infer<typeof workspaceRolesDetailSchema>;

export interface WorkspaceRolesDetailModalProps extends WorkspaceRolesDetail {}
