import { describe, expect, it } from 'vitest';

import { schemaClusterKindDto } from '@/shared/rules/cluster';

import {
  canDeleteCluster,
  canInstallCluster,
  clusterEngineLabel,
  clusterKindLabel,
  defaultRoleFor,
  defaultVersionOf,
  hasBlockingIssue,
  normalizeArchitecture,
  recommendEngine,
  sortVersionsNewestFirst,
  validateClusterNodes,
} from './cluster';
import type { ClusterCandidate, ClusterNodeDraft } from './cluster';

const kubernetes = schemaClusterKindDto.parse({
  name: 'kubernetes',
  title: 'Kubernetes',
  status: 'available',
  min_servers: 1,
  roles: [
    { name: 'server', title: 'Server', min: 1, max: 7, odd: true },
    { name: 'agent', title: 'Agent', min: 0, max: 0, odd: false },
  ],
  engines: [
    {
      name: 'k3s',
      title: 'k3s',
      architectures: ['amd64', 'arm64', 'armhf'],
      versions: ['v1.30.8+k3s1', 'v1.31.4+k3s1'],
      default_version: 'v1.31.4+k3s1',
    },
    {
      name: 'rke2',
      title: 'RKE2',
      architectures: ['amd64', 'arm64'],
      versions: ['v1.31.4+rke2r1'],
      default_version: '',
    },
  ],
});

function server(
  id: string,
  arch?: ClusterCandidate['arch'],
  region?: string,
): ClusterCandidate {
  return { id, hostname: `host-${id}`, address: '', arch, region };
}

function nodes(...roles: string[]): ClusterNodeDraft[] {
  return roles.map((role, index) => ({
    server: server(String(index), 'amd64', 'sg'),
    role,
  }));
}

describe('normalizeArchitecture', () => {
  it.each([
    ['x86_64', 'amd64'],
    ['aarch64', 'arm64'],
    ['armv7l', 'armhf'],
    ['AMD64', 'amd64'],
    ['riscv64', undefined],
    [undefined, undefined],
  ])('maps %s to %s', (raw, expected) => {
    expect(normalizeArchitecture(raw)).toBe(expected);
  });
});

describe('recommendEngine', () => {
  it('recommends RKE2 for amd64-only servers', () => {
    expect(recommendEngine(kubernetes, [server('1', 'amd64')])).toBe('rke2');
  });

  it('recommends k3s when any server is arm', () => {
    expect(
      recommendEngine(kubernetes, [server('1', 'amd64'), server('2', 'arm64')]),
    ).toBe('k3s');
  });

  it('never recommends an engine that cannot run on a picked server', () => {
    expect(recommendEngine(kubernetes, [server('1', 'armhf')])).toBe('k3s');
  });

  it('recommends nothing when no engine fits', () => {
    const only = { ...kubernetes, engines: [kubernetes.engines[1]!] };
    expect(recommendEngine(only, [server('1', 'armhf')])).toBeUndefined();
  });
});

describe('versions', () => {
  it('sorts newest first', () => {
    expect(
      sortVersionsNewestFirst(['v1.30.8+k3s1', 'v1.31.4+k3s1', 'v1.9.0']),
    ).toEqual(['v1.31.4+k3s1', 'v1.30.8+k3s1', 'v1.9.0']);
  });

  it('uses the listed default, else the newest', () => {
    expect(defaultVersionOf(kubernetes.engines[0]!)).toBe('v1.31.4+k3s1');
    expect(defaultVersionOf(kubernetes.engines[1]!)).toBe('v1.31.4+rke2r1');
  });
});

describe('defaultRoleFor', () => {
  it('fills the required role first, then the unlimited one', () => {
    expect(defaultRoleFor(kubernetes.roles, [])).toBe('server');
    expect(defaultRoleFor(kubernetes.roles, nodes('server'))).toBe('agent');
  });
});

describe('validateClusterNodes', () => {
  const codes = (draft: ClusterNodeDraft[]) =>
    validateClusterNodes(kubernetes, draft, kubernetes.engines[1]).map(
      (issue) => issue.code,
    );

  it('needs at least one server', () => {
    expect(codes([])).toEqual(['noServers']);
  });

  it('accepts one server, or three servers and agents', () => {
    expect(codes(nodes('server'))).toEqual([]);
    expect(codes(nodes('server', 'server', 'server', 'agent'))).toEqual([]);
  });

  it('refuses an even server count above one', () => {
    expect(codes(nodes('server', 'server'))).toEqual(['roleOdd']);
  });

  it('needs a server role', () => {
    expect(codes(nodes('agent'))).toEqual(['roleMin']);
  });

  it('caps the server role', () => {
    expect(codes(nodes(...Array(9).fill('server')))).toEqual(['roleMax']);
  });

  it('blocks an engine that cannot run on a picked server', () => {
    const issues = validateClusterNodes(
      kubernetes,
      [{ server: server('1', 'armhf'), role: 'server' }],
      kubernetes.engines[1],
    );
    expect(issues.map((issue) => issue.code)).toEqual(['engineUnsupported']);
    expect(hasBlockingIssue(issues)).toBe(true);
  });

  it('warns about unknown architectures and mixed regions', () => {
    const issues = validateClusterNodes(kubernetes, [
      { server: server('1', undefined, 'sg'), role: 'server' },
      { server: server('2', 'amd64', 'jkt'), role: 'agent' },
    ]);
    expect(issues.map((issue) => issue.code)).toEqual([
      'unknownArch',
      'mixedRegions',
    ]);
    expect(hasBlockingIssue(issues)).toBe(false);
  });
});

describe('canDeleteCluster', () => {
  it.each([
    ['pending', true],
    ['failed', true],
    ['uninstalled', true],
    ['ready', false],
    ['installing', false],
  ])('%s → %s', (status, expected) => {
    expect(canDeleteCluster(status)).toBe(expected);
  });
});

describe('canInstallCluster', () => {
  it.each([
    ['failed', true],
    ['uninstalled', true],
    ['ready', false],
    ['installing', false],
    ['pending', false],
  ])('%s → %s', (status, expected) => {
    expect(canInstallCluster(status)).toBe(expected);
  });
});

describe('cluster labels', () => {
  it('writes engines and kinds as their projects do', () => {
    expect(clusterEngineLabel('k3s')).toBe('k3s');
    expect(clusterEngineLabel('rke2')).toBe('RKE2');
    expect(clusterKindLabel('kubernetes')).toBe('Kubernetes');
    expect(clusterKindLabel('postgresql')).toBe('PostgreSQL');
  });

  it('keeps unknown names and empty values', () => {
    expect(clusterEngineLabel('patroni')).toBe('patroni');
    expect(clusterKindLabel(undefined)).toBe('');
  });
});
