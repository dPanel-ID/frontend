import { z } from 'zod';

export const schemaExecutionV2 = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  organization_id: z.string().optional(),
  actor_subject: z.string().optional(),
  machine_id: z.string().optional(),
  module: z.string().optional(),
  module_id: z.string().optional(),
  trace_id: z.string().optional(),
  uptrace_project_id: z.string().optional(),
  started_at: z.string().optional(),
  finished_at: z.string().optional(),
  error: z.string().optional(),
  error_detail: z.record(z.string(), z.unknown()).optional(),
  event_count: z.number().optional(),
  warning_count: z.number().optional(),
  error_count: z.number().optional(),
  last_event_at: z.string().optional(),
  last_event_type: z.string().optional(),
  last_event_phase: z.string().optional(),
  last_event_status: z.string().optional(),
  last_event_severity: z.string().optional(),
  last_event_message: z.string().optional(),
  first_error_at: z.string().optional(),
  first_error_message: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schemaExecutionDetailV2 = z.object({
  execution: schemaExecutionV2,
  events: z.array(z.unknown()).optional(),
  events_source: z.string().optional(),
  events_stored: z.boolean().optional(),
  events_message: z.string().optional(),
  events_retention_days: z.number().optional(),
  events_retention_expires_at: z.string().optional(),
  events_retained: z.boolean().optional(),
  events_unavailable_reason: z.string().optional(),
});

export type ExecutionV2 = z.infer<typeof schemaExecutionV2>;
export type ExecutionDetailV2 = z.infer<typeof schemaExecutionDetailV2>;
