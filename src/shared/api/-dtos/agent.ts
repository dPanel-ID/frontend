import { z } from 'zod';

/**
 * One Agent v2 registration. last_seen_at is the heartbeat the dashboard uses
 * to tell a quiet agent from a dead one; it is absent for an agent that has
 * registered but never reported.
 */
export const schemaAgentV2 = z.object({
  id: z.string().optional(),
  machine_id: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional(),
  last_seen_at: z.string().optional(),
  nsq_topic: z.string().optional(),
  otel_resource_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type AgentV2 = z.infer<typeof schemaAgentV2>;
