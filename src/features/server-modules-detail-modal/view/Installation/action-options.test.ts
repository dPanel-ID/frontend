import { describe, expect, it } from 'vitest';

import { getAvailableModuleActions } from './action-options';

describe('getAvailableModuleActions', () => {
  it('removes delete and reprovision actions for host-group targets', () => {
    const result = getAvailableModuleActions(
      [
        { name: 'delete', title: 'Delete', playbook: 'delete.yml' },
        {
          name: 'reprovision',
          title: 'Reprovision',
          playbook: 'reprovision.yml',
        },
        { name: 'install', title: 'Install', playbook: 'install.yml' },
      ],
      true,
    );

    expect(result.actions.map((action) => action.name)).toEqual(['install']);
    expect(result.defaultAction?.name).toBe('install');
  });

  it('preserves legacy single-server destructive actions', () => {
    const result = getAvailableModuleActions(
      [
        { name: 'delete', title: 'Delete', playbook: 'delete.yml' },
        { name: 'install', title: 'Install', playbook: 'install.yml' },
      ],
      false,
    );

    expect(result.actions.map((action) => action.name)).toEqual([
      'delete',
      'install',
    ]);
    expect(result.defaultAction?.name).toBe('install');
  });
});
