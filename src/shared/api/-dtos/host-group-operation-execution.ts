import { z } from 'zod';

import { schemaScopedExecutionStatus } from '@/shared/rules/host-group';

import { schemaPublicUser } from './execution';


export const schemaHostGroupOperationExecutionV1 = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    status: schemaScopedExecutionStatus,
    organization_id: z.string().optional(),
    actor_subject: z.string().optional(),
    actor: schemaPublicUser.optional(),
    machine_id: z.string().min(1),
    module: z.string().optional(),
    module_id: z.string().optional(),
    started_at: z.string().optional(),
    finished_at: z.string().optional(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .strict();

export const schemaHostGroupOperationExecutionDetailV1 = z
  .object({
    execution: schemaHostGroupOperationExecutionV1,
    events: z.array(z.never()),
    events_source: z.literal('uptrace'),
    events_stored: z.boolean(),
    events_message: z.string().min(1),
    events_retention_days: z.number().int().nonnegative(),
    events_retention_expires_at: z.string().optional(),
    events_retained: z.boolean(),
    events_unavailable_reason: z.string().optional(),
  })
  .strict();

export type HostGroupOperationExecutionV1 = z.infer<
  typeof schemaHostGroupOperationExecutionV1
>;
export type HostGroupOperationExecutionDetailV1 = z.infer<
  typeof schemaHostGroupOperationExecutionDetailV1
>;
