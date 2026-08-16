import { describe, expect, it } from 'vitest';

import { resolveDeploymentRequestTarget } from './form-submission';

describe('resolveDeploymentRequestTarget', () => {
  it('falls back to the selected server when host-group mode has no persisted group id', () => {
    expect(
      resolveDeploymentRequestTarget({
        hostGroupId: '',
        targetMode: 'hostgroup',
        workerId: 'server-1',
      }),
    ).toEqual({
      explicitTarget: undefined,
      workerId: 'server-1',
    });
  });

  it('sends an explicit host-group target when a persisted group id exists', () => {
    expect(
      resolveDeploymentRequestTarget({
        hostGroupId: 'group-1',
        targetMode: 'hostgroup',
        workerId: 'server-1',
      }),
    ).toEqual({
      explicitTarget: {
        id: 'group-1',
        type: 'hostgroup',
      },
      workerId: '',
    });
  });
});
