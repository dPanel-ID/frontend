import { describe, expect, it } from 'vitest';

import { syncDeploymentTargetSelection } from './target-selection';

describe('syncDeploymentTargetSelection', () => {
  it('preserves an explicit host-group target when the selected server has not changed', () => {
    expect(
      syncDeploymentTargetSelection({
        currentHostGroupId: 'group-1',
        currentTargetMode: 'hostgroup',
        nextHostGroupId: 'group-1',
        nextServerId: 'server-1',
        previousServerId: 'server-1',
      }),
    ).toEqual({
      hostGroupId: 'group-1',
      targetMode: 'hostgroup',
    });
  });

  it('resets the target mode only when the selected server changes', () => {
    expect(
      syncDeploymentTargetSelection({
        currentHostGroupId: 'group-1',
        currentTargetMode: 'hostgroup',
        nextHostGroupId: 'group-2',
        nextServerId: 'server-2',
        previousServerId: 'server-1',
      }),
    ).toEqual({
      hostGroupId: 'group-2',
      targetMode: 'server',
    });
  });

  it('preserves the stored host-group target when the selected server is not in the current page', () => {
    expect(
      syncDeploymentTargetSelection({
        currentHostGroupId: 'group-1',
        currentTargetMode: 'hostgroup',
        nextHostGroupId: undefined,
        nextServerId: 'server-1',
        previousServerId: 'server-1',
      }),
    ).toEqual({
      hostGroupId: 'group-1',
      targetMode: 'hostgroup',
    });
  });
});
