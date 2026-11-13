import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { elapsedSince, installStep, installWait } from './install-wait';

const executions = (...list: DTOs.ExecutionV2[]) =>
  new Map(list.map((execution) => [execution.id ?? '', execution]));

describe('installWait', () => {
  it('says a queued job waits for another job only when one runs', () => {
    expect(
      installWait(
        { status: 'installing', last_execution_id: 'exec_2' },
        executions(
          { id: 'exec_1', status: 'running' },
          { id: 'exec_2', status: 'queued' },
        ),
      ),
    ).toBe('queued');
    expect(
      installWait(
        { status: 'installing', last_execution_id: 'exec_2' },
        executions({ id: 'exec_2', status: 'queued' }),
      ),
    ).toBe('starting');
  });

  it('says a job in the package-manager wait waits for another install', () => {
    expect(
      installWait(
        { status: 'installing', last_execution_id: 'exec_2' },
        executions({
          id: 'exec_2',
          status: 'running',
          last_event_message:
            'Task started: Wait for other package installs to finish',
        }),
      ),
    ).toBe('packageManager');
  });

  it('says nothing for a running install or an installed module', () => {
    const running = executions({
      id: 'exec_2',
      status: 'running',
      last_event_message: 'Task started: Install Python',
    });
    expect(
      installWait(
        { status: 'installing', last_execution_id: 'exec_2' },
        running,
      ),
    ).toBeUndefined();
    expect(
      installWait(
        { status: 'installed', last_execution_id: 'exec_2' },
        running,
      ),
    ).toBeUndefined();
  });
});

describe('installStep', () => {
  const installing = { status: 'installing', last_execution_id: 'exec_3' };

  it('names the task a running install is on, without its role', () => {
    expect(
      installStep(
        installing,
        executions({
          id: 'exec_3',
          status: 'running',
          started_at: '2026-11-13T08:00:00Z',
          last_event_type: 'ansible_callback_task_started',
          last_event_phase: 'fauust.mariadb : Install packages (apt)',
        }),
      ),
    ).toEqual({
      step: 'Install packages (apt)',
      startedAt: '2026-11-13T08:00:00Z',
    });
  });

  it("hides dPanel's wrapper tasks but keeps the start time", () => {
    expect(
      installStep(
        installing,
        executions({
          id: 'exec_3',
          status: 'running',
          started_at: '2026-11-13T08:00:00Z',
          last_event_type: 'ansible_callback_task_started',
          last_event_phase: 'Run role "fauust.mariadb"',
        }),
      ),
    ).toEqual({ step: '', startedAt: '2026-11-13T08:00:00Z' });
  });

  it('says nothing for a queued job or an installed module', () => {
    expect(
      installStep(installing, executions({ id: 'exec_3', status: 'queued' })),
    ).toBeUndefined();
    expect(
      installStep(
        { status: 'installed', last_execution_id: 'exec_3' },
        executions({ id: 'exec_3', status: 'running' }),
      ),
    ).toBeUndefined();
  });
});

describe('elapsedSince', () => {
  it('reads minutes and seconds', () => {
    const now = new Date('2026-11-13T08:03:12Z').getTime();
    expect(elapsedSince('2026-11-13T08:00:00Z', now)).toBe('3m 12s');
    expect(elapsedSince('2026-11-13T08:03:00Z', now)).toBe('12s');
    expect(elapsedSince(undefined, now)).toBe('');
  });
});
