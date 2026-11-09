import { describe, expect, it } from 'vitest';

import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

import {
  headlineState,
  isMovingStatus,
  liveServerCount,
  releaseStatusOfArtifact,
  releaseTone,
  serversOf,
} from './describe-detail';

function artifact(status: string, id = 'a1'): CicdArtifact {
  return { id, state: { status } } as unknown as CicdArtifact;
}

function deployment(
  status: string,
  options: {
    artifactId?: string;
    serverId?: string;
    id?: string;
    hostName?: string;
  } = {},
): CicdDeployment {
  const { artifactId = 'a1', serverId = 's1', id = 'd1', hostName } = options;

  return {
    id,
    state: { status },
    pointerIds: { artifact: artifactId, machine: serverId, application: 'app' },
    serverSnapshot: { id: serverId, hostName: hostName ?? serverId },
  } as unknown as CicdDeployment;
}

describe('releaseStatusOfArtifact', () => {
  it('reports the release state when the build is the one on the server', () => {
    expect(
      releaseStatusOfArtifact({
        artifact: artifact('ready'),
        lastDeployment: deployment('ready'),
      }),
    ).toBe('deployed');
  });

  // A build row is ready once it exists; a deploy that then fails must not
  // leave the Overview saying it passed while Releases says it failed.
  it('reports a failed release even though the build row is ready', () => {
    expect(
      releaseStatusOfArtifact({
        artifact: artifact('ready'),
        lastDeployment: deployment('failed'),
      }),
    ).toBe('failed');
  });

  it('lets a running build outrank the release it is about to replace', () => {
    expect(
      releaseStatusOfArtifact({
        artifact: artifact('progress'),
        lastDeployment: deployment('ready'),
      }),
    ).toBe('progress');
  });

  it('falls back to the build state when another build is on the server', () => {
    expect(
      releaseStatusOfArtifact({
        artifact: artifact('failed', 'a2'),
        lastDeployment: deployment('ready', { artifactId: 'a1' }),
      }),
    ).toBe('failed');
  });

  it('calls a finished build that was never released inactive', () => {
    expect(
      releaseStatusOfArtifact({
        artifact: artifact('ready'),
        lastDeployment: null,
      }),
    ).toBe('inactive');
  });
});

describe('releaseTone', () => {
  it.each([
    ['deployed', 'success'],
    ['progress', 'info'],
    ['failed', 'danger'],
    ['cancelled', 'warning'],
    ['inactive', 'neutral'],
  ] as const)('maps %s to %s', (status, tone) => {
    expect(releaseTone(status)).toBe(tone);
  });
});

describe('isMovingStatus', () => {
  it('is true only while something is still changing', () => {
    expect(isMovingStatus('progress')).toBe(true);
    expect(isMovingStatus('pending')).toBe(true);
    expect(isMovingStatus('deleting')).toBe(true);
    expect(isMovingStatus('ready')).toBe(false);
  });
});

describe('headlineState', () => {
  it('reports live when something is serving', () => {
    expect(
      headlineState({
        lastBuild: artifact('ready'),
        deployments: [deployment('ready')],
      }),
    ).toBe('live');
  });

  it('lets work in flight outrank a healthy release', () => {
    expect(
      headlineState({
        lastBuild: artifact('progress'),
        deployments: [deployment('ready')],
      }),
    ).toBe('building');
  });

  it('only raises a failure when nothing is serving', () => {
    expect(
      headlineState({
        lastBuild: artifact('failed'),
        deployments: [deployment('ready')],
      }),
    ).toBe('live');

    expect(
      headlineState({ lastBuild: artifact('failed'), deployments: [] }),
    ).toBe('attention');
  });

  it('is idle with no history at all', () => {
    expect(headlineState({ deployments: [] })).toBe('idle');
  });
});

describe('liveServerCount', () => {
  it('counts each server once, however many releases it has', () => {
    expect(
      liveServerCount([
        deployment('ready', { serverId: 's1', id: 'd1' }),
        deployment('ready', { serverId: 's1', id: 'd2' }),
        deployment('ready', { serverId: 's2', id: 'd3' }),
        deployment('failed', { serverId: 's3', id: 'd4' }),
      ]),
    ).toBe(2);
  });
});

// `/v1/application/detail/{id}` returns deploys with no embedded machine,
// so `deploymentTargets` is always empty and the page used to say
// "of 0 connected" beside a running service.
describe('serversOf', () => {
  it('takes the servers from the deployment snapshots', () => {
    expect(
      serversOf([
        deployment('ready', { serverId: '93', hostName: 'docs-demo-01' }),
      ]),
    ).toEqual([{ id: '93', name: 'docs-demo-01' }]);
  });

  it('counts a server once however many releases it has', () => {
    expect(
      serversOf([
        deployment('ready', { serverId: '93', id: 'd1' }),
        deployment('failed', { serverId: '93', id: 'd2' }),
        deployment('ready', { serverId: '94', id: 'd3' }),
      ]),
    ).toHaveLength(2);
  });

  it('still uses the detail list when it does arrive', () => {
    expect(serversOf([], [{ id: '93', name: 'docs-demo-01' }])).toEqual([
      { id: '93', name: 'docs-demo-01' },
    ]);
  });

  it('prefers the snapshot name over the fallback', () => {
    expect(
      serversOf(
        [deployment('ready', { serverId: '93', hostName: 'real' })],
        [{ id: '93', name: 'stale' }],
      ),
    ).toEqual([{ id: '93', name: 'real' }]);
  });

  it('falls back to the id when nothing names the server', () => {
    expect(serversOf([], [{ id: '93' }])).toEqual([{ id: '93', name: '93' }]);
  });
});
