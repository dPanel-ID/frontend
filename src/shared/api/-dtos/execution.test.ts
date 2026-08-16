import { describe, expect, it } from 'vitest';

import {
  schemaExecutionDetailV2,
  schemaExecutionV2,
} from './execution';

describe('schemaExecutionV2', () => {
  it('parses the execution entity fields exposed by the backend contract', () => {
    expect(
      schemaExecutionV2.parse({
        id: 'execution-1',
        type: 'deploy',
        status: 'running',
        organization_id: 'org-1',
        actor_subject: 'user-1',
        machine_id: 'server-1',
        module: 'deploy',
        module_id: 'module-1',
        trace_id: 'trace-1',
        uptrace_project_id: 'uptrace-1',
        started_at: '2026-08-16T10:00:00Z',
        finished_at: '2026-08-16T10:05:00Z',
        error: 'failed',
        error_detail: {
          message: 'boom',
        },
        event_count: 12,
        warning_count: 2,
        error_count: 1,
        last_event_at: '2026-08-16T10:04:00Z',
        last_event_type: 'step',
        last_event_phase: 'run',
        last_event_status: 'running',
        last_event_severity: 'warning',
        last_event_message: 'working',
        first_error_at: '2026-08-16T10:03:00Z',
        first_error_message: 'boom',
        created_at: '2026-08-16T10:00:00Z',
        updated_at: '2026-08-16T10:05:00Z',
      }),
    ).toMatchObject({
      trace_id: 'trace-1',
      uptrace_project_id: 'uptrace-1',
      started_at: '2026-08-16T10:00:00Z',
      finished_at: '2026-08-16T10:05:00Z',
      event_count: 12,
      first_error_message: 'boom',
    });
  });
});

describe('schemaExecutionDetailV2', () => {
  it('parses execution detail payloads with backend detail metadata', () => {
    expect(
      schemaExecutionDetailV2.parse({
        execution: {
          id: 'execution-1',
          trace_id: 'trace-1',
          uptrace_project_id: 'uptrace-1',
        },
        events: [],
        events_source: 'database',
        events_stored: true,
        events_message: 'available',
        events_retention_days: 7,
        events_retention_expires_at: '2026-08-23T00:00:00Z',
        events_retained: true,
        events_unavailable_reason: 'none',
      }),
    ).toMatchObject({
      execution: {
        id: 'execution-1',
        trace_id: 'trace-1',
        uptrace_project_id: 'uptrace-1',
      },
      events_source: 'database',
      events_retained: true,
    });
  });
});
