import { z } from 'zod';

import { schemaCommandStatus } from '@/shared/rules/host-group';

export const schemaAgentCommandV2 = z.object({
  id: z.string().min(1),
  execution_id: z.string().optional(),
  machine_id: z.string().min(1),
  command_type: z.string().min(1),
  status: schemaCommandStatus,
  requested_by: z.string().optional(),
  expires_at: z.string().optional(),
  started_at: z.string().optional(),
  finished_at: z.string().optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
}).strict();

export const schemaHostGroupOperationAgentCommandDetailV2 = z.object({
  command: schemaAgentCommandV2,
}).strict();

export type AgentCommandV2 = z.infer<typeof schemaAgentCommandV2>;
export type HostGroupOperationAgentCommandDetailV2 = z.infer<
  typeof schemaHostGroupOperationAgentCommandDetailV2
>;
