import type { HostGroupOperationTarget } from '@/entities/host-group/rules/schema';

export interface OperationTargetLinks {
  agentCommand:
    | {
        to: '/servers/groups/$groupId/operations/agent-commands/$id';
        params: {
          groupId: string;
          id: string;
        };
        search: {
          executionId: string;
          machineId: string;
        };
      }
    | null;
  deployment:
    | {
        to: '/servers/groups/$groupId/operations/deployments/$id';
        params: {
          groupId: string;
          id: string;
        };
      }
    | null;
  execution:
    | {
        to: '/servers/groups/$groupId/operations/executions/$id';
        params: {
          groupId: string;
          id: string;
        };
      }
    | null;
  server: {
    to: '/servers/$id';
    params: {
      id: string;
    };
  };
}

export function buildOperationTargetLinks(params: {
  groupId: string;
  target: HostGroupOperationTarget;
}): OperationTargetLinks {
  const { groupId, target } = params;

  return {
    agentCommand:
      target.agentCommandId && target.executionId
        ? {
            to: '/servers/groups/$groupId/operations/agent-commands/$id',
            params: {
              groupId,
              id: target.agentCommandId,
            },
            search: {
              executionId: target.executionId,
              machineId: target.serverId,
            },
          }
        : null,
    deployment: target.deploymentId
      ? {
          to: '/servers/groups/$groupId/operations/deployments/$id',
          params: {
            groupId,
            id: target.deploymentId,
          },
        }
      : null,
    execution: target.executionId
      ? {
          to: '/servers/groups/$groupId/operations/executions/$id',
          params: {
            groupId,
            id: target.executionId,
          },
        }
      : null,
    server: {
      to: '/servers/$id',
      params: {
        id: target.serverId,
      },
    },
  };
}
