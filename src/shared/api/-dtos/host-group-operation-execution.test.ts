import { describe, expect, it } from 'vitest';

import {
  schemaHostGroupOperationExecutionDetailV1,
  schemaHostGroupOperationExecutionV1,
} from './host-group-operation-execution';

describe('schemaHostGroupOperationExecutionV1', () => {
  it('parses only the scoped execution summary fields returned by the backend', () => {
    const parsed = schemaHostGroupOperationExecutionV1.parse({
      id: 'execution-1',
      type: 'deploy',
      status: 'running',
      organization_id: 'org-1',
      actor_subject: 'user-1',
      machine_id: 'server-1',
      module: 'deploy',
      module_id: 'module-1',
      started_at: '2026-08-16T10:00:00Z',
      finished_at: '2026-08-16T10:05:00Z',
      created_at: '2026-08-16T10:00:00Z',
      updated_at: '2026-08-16T10:05:00Z',
    });

    expect(parsed).toMatchObject({
      id: 'execution-1',
      machine_id: 'server-1',
      module_id: 'module-1',
      updated_at: '2026-08-16T10:05:00Z',
    });
    expect(parsed).not.toHaveProperty('trace_id');
    expect(parsed).not.toHaveProperty('error');
    expect(parsed).not.toHaveProperty('event_count');
  });

  it('rejects legacy broad execution fields that the scoped endpoint must never expose', () => {
    expect(() =>
      schemaHostGroupOperationExecutionV1.parse({
        id: 'execution-1',
        trace_id: 'trace-1',
        uptrace_project_id: 'uptrace-1',
        error: 'boom',
        error_detail: {
          message: 'boom',
        },
        event_count: 2,
        last_event_message: 'warning',
        first_error_message: 'boom',
      }),
    ).toThrow();
  });
});

describe('schemaHostGroupOperationExecutionDetailV1', () => {
  it('parses scoped execution detail payloads with retention metadata only', () => {
    const parsed = schemaHostGroupOperationExecutionDetailV1.parse({
      execution: {
        id: 'execution-1',
        type: 'deploy',
        status: 'running',
      },
      events: [],
      events_source: 'uptrace',
      events_stored: false,
      events_message: 'retained for 0 days',
      events_retention_days: 0,
      events_retention_expires_at: '2026-08-16T10:05:00Z',
      events_retained: false,
      events_unavailable_reason: 'retention',
    });

    expect(parsed).toMatchObject({
      execution: {
        id: 'execution-1',
        type: 'deploy',
        status: 'running',
      },
      events_source: 'uptrace',
      events_retained: false,
    });
    expect(parsed.execution).not.toHaveProperty('trace_id');
    expect(parsed.execution).not.toHaveProperty('error_detail');
  });
});
