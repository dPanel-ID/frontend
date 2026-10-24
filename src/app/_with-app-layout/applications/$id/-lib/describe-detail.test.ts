import { describe, expect, it } from 'vitest';

import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

import {
  headlineState,
  isMovingStatus,
  liveServerCount,
  releaseStatusOfArtifact,
  releaseTone,
} from './describe-detail';

function artifact(status: string, id = 'a1'): CicdArtifact {
  return { id, state: { status } } as unknown as CicdArtifact;
}

function deployment(
  status: string,
  options: { artifactId?: string; serverId?: string; id?: string } = {},
): CicdDeployment {
  const { artifactId = 'a1', serverId = 's1', id = 'd1' } = options;

  return {
    id,
    state: { status },
    pointerIds: { artifact: artifactId, machine: serverId, application: 'app' },
    serverSnapshot: { id: serverId, hostName: serverId },
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
      releaseStatusOfArtifact({ artifact: artifact('ready'), lastDeployment: null }),
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
