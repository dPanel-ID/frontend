import { describe, expect, it } from 'vitest';

import { buildOperationTargetLinks } from './operation-target-links';

describe('buildOperationTargetLinks', () => {
  it('builds real child-detail links for operation targets', () => {
    expect(
      buildOperationTargetLinks({
        groupId: 'group-1',
        operationId: 'operation-1',
        target: {
          agentCommandId: 'cmd-1',
          deploymentId: 'deploy-1',
          error: undefined,
          executionId: 'exec-1',
          id: 'target-1',
          serverId: 'server-1',
          status: 'queued',
        },
      }),
    ).toEqual({
      agentCommand: {
        params: {
          groupId: 'group-1',
          machineId: 'server-1',
          operationId: 'operation-1',
        },
        to: '/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId',
      },
      deployment: {
        params: {
          groupId: 'group-1',
          id: 'deploy-1',
        },
        to: '/servers/groups/$groupId/operations/deployments/$id',
      },
      execution: {
        params: {
          groupId: 'group-1',
          machineId: 'server-1',
          operationId: 'operation-1',
        },
        to: '/servers/groups/$groupId/operations/executions/$operationId/$machineId',
      },
      server: {
        params: {
          id: 'server-1',
        },
        to: '/servers/$id',
      },
    });
  });

  it('omits child links that do not have enough backend identifiers', () => {
    expect(
      buildOperationTargetLinks({
        groupId: 'group-1',
        operationId: 'operation-1',
        target: {
          agentCommandId: 'cmd-1',
          error: undefined,
          id: 'target-1',
          serverId: 'server-1',
          status: 'queued',
        },
      }),
    ).toEqual({
      agentCommand: {
        params: {
          groupId: 'group-1',
          machineId: 'server-1',
          operationId: 'operation-1',
        },
        to: '/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId',
      },
      deployment: null,
      execution: null,
      server: {
        params: {
          id: 'server-1',
        },
        to: '/servers/$id',
      },
    });
  });
});
