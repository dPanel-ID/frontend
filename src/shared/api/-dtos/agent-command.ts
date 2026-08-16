import { z } from 'zod';

export const schemaAgentCommandV2 = z.object({
  id: z.string().optional(),
  execution_id: z.string().optional(),
  machine_id: z.string().optional(),
  command_type: z.string().optional(),
  status: z.string().optional(),
  requested_by: z.string().optional(),
  expires_at: z.string().optional(),
  started_at: z.string().optional(),
  finished_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schemaHostGroupOperationAgentCommandDetailV2 = z.object({
  command: schemaAgentCommandV2,
});

export type AgentCommandV2 = z.infer<typeof schemaAgentCommandV2>;
export type HostGroupOperationAgentCommandDetailV2 = z.infer<
  typeof schemaHostGroupOperationAgentCommandDetailV2
>;
