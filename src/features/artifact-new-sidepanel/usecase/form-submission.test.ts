import { describe, expect, it } from 'vitest';

import {
  buildReleaseRequest,
  resolveDeploymentRequestTarget,
} from './form-submission';

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

// "Build and release" on the server the application already runs on only
// built the artifact and left it "Not released".
describe('buildReleaseRequest', () => {
  it('releases onto the selected server, the current one included', () => {
    const request = buildReleaseRequest({
      applicationId: '118',
      artifactId: '900',
      target: resolveDeploymentRequestTarget({
        targetMode: 'server',
        workerId: '370',
      }),
    });

    expect(request).toEqual({
      applicationId: '118',
      artifactId: '900',
      workerId: '370',
      isPrimary: true,
      target: undefined,
    });
    expect(request).not.toHaveProperty('noDeploy');
  });

  it('releases onto every server of a host group', () => {
    expect(
      buildReleaseRequest({
        applicationId: '118',
        artifactId: '900',
        target: resolveDeploymentRequestTarget({
          hostGroupId: 'group-1',
          targetMode: 'hostgroup',
          workerId: '370',
        }),
      }),
    ).toMatchObject({
      workerId: '',
      target: { id: 'group-1', type: 'hostgroup' },
    });
  });
});
