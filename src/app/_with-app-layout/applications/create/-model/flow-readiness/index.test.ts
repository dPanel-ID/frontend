import { describe, expect, it } from 'vitest';

import { evaluateFlowReadiness, flowStepKeys } from './index';
import type { FlowReadinessInput } from './index';

function input(
  overrides: Partial<FlowReadinessInput> = {},
): FlowReadinessInput {
  return {
    flowMode: 'create',
    appSourceMode: 'github',
    appSourceBundleIdent: null,
    appSourceGithubRepo: 'https://github.com/acme/site',
    gitRepoConfig: { gitBranch: 'main', gitHead: 'abc123' },
    hostedServerID: 7,
    appName: 'site',
    appPort: '3000',
    portConflict: false,
    appBuildCommand: ['npm ci'],
    appRunCommand: 'npm start',
    selectedDependencyIds: ['dep-node'],
    dependencyConfigs: {
      'dep-node': {
        id: 'dep-node',
        name: 'node',
        category: ['language'],
        selectionId: 'node',
      } as never,
    },
    selectedRequiredBinaryIds: ['binary:node'],
    requiredBinaryConfigs: { 'binary:node': {} },
    ...overrides,
  };
}

describe('evaluateFlowReadiness', () => {
  it('marks a fully filled flow ready', () => {
    const readiness = evaluateFlowReadiness(input());

    expect(readiness).toEqual({
      '1-source': true,
      '2-server-dependencies': true,
      '3-details': true,
      '4-env': true,
      '5-preview': true,
    });
  });

  it('needs a branch and a head, not just a repository', () => {
    expect(
      evaluateFlowReadiness(input({ gitRepoConfig: { gitBranch: 'main' } }))[
        '1-source'
      ],
    ).toBe(false);

    expect(
      evaluateFlowReadiness(input({ gitRepoConfig: { gitHead: 'abc' } }))[
        '1-source'
      ],
    ).toBe(false);
  });

  it('accepts a bundle source without any git config', () => {
    const readiness = evaluateFlowReadiness(
      input({
        appSourceMode: 'bundle',
        appSourceBundleIdent: 'wordpress',
        appSourceGithubRepo: null,
        gitRepoConfig: null,
      }),
    );

    expect(readiness['1-source']).toBe(true);
  });

  it('needs a server and at least one configured dependency', () => {
    expect(
      evaluateFlowReadiness(input({ hostedServerID: null }))[
        '2-server-dependencies'
      ],
    ).toBe(false);

    expect(
      evaluateFlowReadiness(input({ selectedDependencyIds: [] }))[
        '2-server-dependencies'
      ],
    ).toBe(false);
  });

  // The old wizard folded this into its Continue button. It has to survive
  // the move, or the review panel would offer a deploy that fails on install.
  it('is not ready when the port is already taken on the server', () => {
    expect(
      evaluateFlowReadiness(input({ portConflict: true }))['3-details'],
    ).toBe(false);
  });

  it('needs a valid name, a build command, a run command and a port', () => {
    for (const override of [
      { appName: '' },
      { appName: 'my-app' },
      { appBuildCommand: ['   '] },
      { appRunCommand: '' },
      { appPort: '' },
    ] satisfies Array<Partial<FlowReadinessInput>>) {
      expect(evaluateFlowReadiness(input(override))['3-details']).toBe(false);
    }
  });

  it('treats environment variables as optional', () => {
    expect(evaluateFlowReadiness(input())['4-env']).toBe(true);
  });
});

describe('flowStepKeys', () => {
  it('shows every section when creating', () => {
    expect(flowStepKeys('create')).toHaveLength(5);
  });

  it('drops the source section when updating', () => {
    const keys = flowStepKeys('update');

    expect(keys).toHaveLength(4);
    expect(keys).not.toContain('1-source');
  });
});
