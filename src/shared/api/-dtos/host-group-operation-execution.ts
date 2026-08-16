import { z } from 'zod';

export const schemaHostGroupOperationExecutionV1 = z
  .object({
    id: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    organization_id: z.string().optional(),
    actor_subject: z.string().optional(),
    machine_id: z.string().optional(),
    module: z.string().optional(),
    module_id: z.string().optional(),
    started_at: z.string().optional(),
    finished_at: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

export const schemaHostGroupOperationExecutionDetailV1 = z
  .object({
    execution: schemaHostGroupOperationExecutionV1,
    events: z.array(z.never()).optional(),
    events_source: z.string().optional(),
    events_stored: z.boolean().optional(),
    events_message: z.string().optional(),
    events_retention_days: z.number().optional(),
    events_retention_expires_at: z.string().optional(),
    events_retained: z.boolean().optional(),
    events_unavailable_reason: z.string().optional(),
  })
  .strict();

export type HostGroupOperationExecutionV1 = z.infer<
  typeof schemaHostGroupOperationExecutionV1
>;
export type HostGroupOperationExecutionDetailV1 = z.infer<
  typeof schemaHostGroupOperationExecutionDetailV1
>;
