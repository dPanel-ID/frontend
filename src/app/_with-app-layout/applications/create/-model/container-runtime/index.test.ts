import { describe, expect, it } from 'vitest';

import type { DependencyConfig } from '../store/form.types';

import { containerRuntime } from './index';

function dependency(overrides: Partial<DependencyConfig>): DependencyConfig {
  return {
    id: 'dep',
    name: 'dep',
    title: 'Dep',
    variables: {},
    roles: [],
    ref: { name: '', expectedCommit: '' },
    ...overrides,
  };
}

const configs: Record<string, DependencyConfig> = {
  'dep-docker': dependency({
    id: 'dep-docker',
    moduleId: 'docker',
    version: '29.4.3',
    category: ['containers'],
  }),
  'dep-redis': dependency({
    id: 'dep-redis',
    moduleId: 'redis',
    category: ['database'],
  }),
  'dep-node': dependency({
    id: 'dep-node',
    moduleId: 'nodejs',
    category: ['language'],
  }),
};

describe('containerRuntime', () => {
  it('uses Docker as the runtime of a container-only application', () => {
    expect(containerRuntime(['dep-docker', 'dep-redis'], configs)).toEqual({
      name: 'docker',
      version: '29.4.3',
    });
  });

  it('leaves the runtime to a selected language module', () => {
    expect(containerRuntime(['dep-docker', 'dep-node'], configs)).toBe(
      undefined,
    );
  });

  it('has no runtime without Docker', () => {
    expect(containerRuntime(['dep-redis'], configs)).toBe(undefined);
    expect(containerRuntime([], configs)).toBe(undefined);
  });
});
