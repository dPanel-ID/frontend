import { describe, expect, it } from 'vitest';

import { validateWorkerForm } from './form';

describe('validateWorkerForm', () => {
  it('accepts a VM worker and trims it', () => {
    expect(
      validateWorkerForm({
        type: 'vm',
        name: ' office ',
        executorId: ' office-vm-01 ',
      }),
    ).toEqual({
      ok: true,
      values: { type: 'vm', name: 'office', executorId: 'office-vm-01' },
    });
  });

  it.each([
    ['', 'executorIdRequired'],
    ['a', 'executorIdInvalid'],
    ['office_vm', 'executorIdInvalid'],
    ['office vm', 'executorIdInvalid'],
    ['-office', 'executorIdInvalid'],
    ['a'.repeat(64), 'executorIdInvalid'],
  ])('rejects executor ID %o with %s', (executorId, error) => {
    expect(
      validateWorkerForm({ type: 'vm', name: 'office', executorId }),
    ).toEqual({ ok: false, errors: { executorId: error } });
  });

  it('lowercases the executor ID like the API does', () => {
    expect(
      validateWorkerForm({ type: 'vm', name: 'o', executorId: 'Office-VM-01' }),
    ).toMatchObject({ ok: true, values: { executorId: 'office-vm-01' } });
  });

  it('requires a name', () => {
    expect(
      validateWorkerForm({ type: 'vm', name: '  ', executorId: 'ok' }),
    ).toEqual({ ok: false, errors: { name: 'nameRequired' } });
  });

  it('accepts a GitHub worker from a pasted URL', () => {
    expect(
      validateWorkerForm({
        type: 'github',
        name: 'ci',
        repository: 'https://github.com/acme/dpanel-workers',
        workflow: 'dpanel-worker.yml',
        ref: 'release/v1',
      }),
    ).toEqual({
      ok: true,
      values: {
        type: 'github',
        name: 'ci',
        repository: 'acme/dpanel-workers',
        workflow: 'dpanel-worker.yml',
        ref: 'release/v1',
      },
    });
  });

  it('reports every invalid GitHub field', () => {
    expect(
      validateWorkerForm({
        type: 'github',
        name: 'ci',
        repository: 'acme',
        workflow: 'worker.json',
        ref: 'main..x',
      }),
    ).toEqual({
      ok: false,
      errors: {
        repository: 'repositoryInvalid',
        workflow: 'workflowInvalid',
        ref: 'refInvalid',
      },
    });
  });
});
