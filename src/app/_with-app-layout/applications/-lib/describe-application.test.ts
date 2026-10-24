import { describe, expect, it } from 'vitest';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import {
  applicationBucket,
  applicationSource,
  applicationTone,
} from './describe-application';

const app = (
  service: string,
  build: string,
  identity?: Partial<ApplicationCard['identity']>,
  deployStatuses: string[] = [],
): ApplicationCard =>
  ({
    id: '1',
    identity: {
      name: 'api',
      bundleType: 'docker',
      source: 'independent',
      ...identity,
    },
    state: { service, lastArtifact: { status: build } },
    additionalInfo: {
      deploymentCount: deployStatuses.length,
      servers: deployStatuses.map((deployStatus, index) => ({
        id: String(index),
        deployStatus,
      })),
    },
  }) as unknown as ApplicationCard;

describe('applicationBucket', () => {
  it('lets a running service win over anything the build says', () => {
    expect(applicationBucket(app('running', 'failed'))).toBe('running');
    expect(applicationBucket(app('running', 'progress'))).toBe('running');
  });

  it('treats a stopped or broken service as needing attention', () => {
    for (const service of ['dead', 'failed', 'exited']) {
      expect(applicationBucket(app(service, 'ready'))).toBe('attention');
    }
  });

  it('counts a failed build only when nothing is running', () => {
    expect(applicationBucket(app('unknown', 'failed'))).toBe('attention');
    expect(applicationBucket(app('unknown', 'cancelled'))).toBe('attention');
  });

  it('reports work in progress', () => {
    expect(applicationBucket(app('unknown', 'progress'))).toBe('building');
    expect(applicationBucket(app('restarting', 'ready'))).toBe('building');
  });

  it('keeps anything unrecognised out of the healthy bucket', () => {
    expect(applicationBucket(app('unknown', 'unknown'))).toBe('other');
    expect(applicationBucket(app('', ''))).toBe('other');
  });
});

describe('applicationTone', () => {
  it('never colours an unknown application as healthy', () => {
    expect(applicationTone(app('running', 'ready'))).toBe('success');
    expect(applicationTone(app('unknown', 'progress'))).toBe('info');
    expect(applicationTone(app('dead', 'ready'))).toBe('danger');
    expect(applicationTone(app('unknown', 'unknown'))).toBe('neutral');
  });
});

describe('applicationSource', () => {
  it('names the repository when there is one', () => {
    const repo = app('running', 'ready', {
      source: 'repository',
      sourceKind: 'github',
      repoName: 'api',
      repoOrganization: 'devetek',
    } as never);

    expect(applicationSource(repo)).toBe('devetek/api');
  });

  it('falls back to the bundle type', () => {
    expect(applicationSource(app('running', 'ready'))).toBe('docker');
  });
});

// `/v1/application/find` returns no service state and no artifact status,
// so every application read as "Not running" whatever it was doing. What
// it does return is how each release installed.
describe('applicationBucket, falling back to the release', () => {
  it('calls an installed release running', () => {
    expect(applicationBucket(app('unknown', 'unknown', {}, ['ready']))).toBe(
      'running',
    );
  });

  it('lets an installing release outrank an installed one', () => {
    expect(
      applicationBucket(app('unknown', 'unknown', {}, ['ready', 'progress'])),
    ).toBe('building');
    expect(
      applicationBucket(app('unknown', 'unknown', {}, ['ready', 'pending'])),
    ).toBe('building');
  });

  it('raises a failed release only when nothing is installed', () => {
    expect(
      applicationBucket(app('unknown', 'unknown', {}, ['ready', 'failed'])),
    ).toBe('running');
    expect(applicationBucket(app('unknown', 'unknown', {}, ['failed']))).toBe(
      'attention',
    );
  });

  it('is still other with no releases at all', () => {
    expect(applicationBucket(app('unknown', 'unknown', {}, []))).toBe('other');
  });

  it('never overrides what the service itself says', () => {
    expect(applicationBucket(app('dead', 'unknown', {}, ['ready']))).toBe(
      'attention',
    );
  });
});
