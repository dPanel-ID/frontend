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
    additionalInfo: { deploymentCount: 0, servers: [] },
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
