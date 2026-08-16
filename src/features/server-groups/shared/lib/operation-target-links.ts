import type { HostGroupOperationTarget } from '@/entities/host-group/rules/schema';

export interface OperationTargetLinks {
  agentCommand:
    | {
        to: '/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId';
        params: {
          groupId: string;
          machineId: string;
          operationId: string;
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
        to: '/servers/groups/$groupId/operations/executions/$operationId/$machineId';
        params: {
          groupId: string;
          machineId: string;
          operationId: string;
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
  operationId: string;
  target: HostGroupOperationTarget;
}): OperationTargetLinks {
  const { groupId, operationId, target } = params;

  return {
    agentCommand:
      target.agentCommandId
        ? {
            to: '/servers/groups/$groupId/operations/agent-commands/$operationId/$machineId',
            params: {
              groupId,
              machineId: target.serverId,
              operationId,
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
          to: '/servers/groups/$groupId/operations/executions/$operationId/$machineId',
          params: {
            groupId,
            machineId: target.serverId,
            operationId,
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
