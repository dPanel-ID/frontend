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
  // Display labels joined by the API so a feed row can name its machine
  // without a lookup. Absent for executions with no machine, and for
  // machines that have since been deleted.
  machine_hostname: z.string().optional(),
  machine_address: z.string().optional(),
});

/** Execution counts by lifecycle state inside a reporting window. */
export const schemaExecutionSummaryV2 = z.object({
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  total: z.number().optional(),
  pending: z.number().optional(),
  queued: z.number().optional(),
  running: z.number().optional(),
  succeeded: z.number().optional(),
  failed: z.number().optional(),
  cancelled: z.number().optional(),
  other: z.number().optional(),
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
export type ExecutionSummaryV2 = z.infer<typeof schemaExecutionSummaryV2>;

/** One bucket of execution outcomes on the activity chart. */
export const schemaExecutionTimeseriesPointV2 = z.object({
  timestamp: z.string(),
  total: z.number().optional(),
  succeeded: z.number().optional(),
  failed: z.number().optional(),
  cancelled: z.number().optional(),
  running: z.number().optional(),
  pending: z.number().optional(),
  other: z.number().optional(),
});

/**
 * Execution activity over time. Points are contiguous and ordered oldest
 * first, with empty buckets included, so a chart can plot them without
 * filling gaps itself.
 */
export const schemaExecutionTimeseriesV2 = z.object({
  bucket: z.enum(['hour', 'day']).optional(),
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  total: z.number().optional(),
  points: z.array(schemaExecutionTimeseriesPointV2).optional(),
});

export type ExecutionTimeseriesPointV2 = z.infer<
  typeof schemaExecutionTimeseriesPointV2
>;
export type ExecutionTimeseriesV2 = z.infer<typeof schemaExecutionTimeseriesV2>;
