import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { installWait } from './install-wait';

const executions = (...list: DTOs.ExecutionV2[]) =>
  new Map(list.map((execution) => [execution.id ?? '', execution]));

describe('installWait', () => {
  it('says a queued job waits for another job on the server', () => {
    expect(
      installWait(
        { status: 'installing', last_execution_id: 'exec_2' },
        executions({ id: 'exec_2', status: 'queued' }),
      ),
    ).toBe('queued');
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
