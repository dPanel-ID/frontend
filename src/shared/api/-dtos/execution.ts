export interface ExecutionV2 {
  id?: string;
  type?: string;
  status?: string;
  machine_id?: string;
  module?: string;
  module_id?: string;
  organization_id?: string;
  actor_subject?: string;
  traceparent?: string;
  uptrace_project?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionDetailV2 {
  execution: ExecutionV2;
  events?: unknown[];
  events_source?: string;
  events_stored?: boolean;
  events_message?: string;
  events_retention_days?: number;
  events_retention_expires_at?: string;
  events_retained?: boolean;
  events_unavailable_reason?: string;
}
