import { createAdapter } from '@/entities/shared/lib/createAdapter';

import type { DTOs } from '@/shared/api';

import {
  schemaHostGroupDetail,
  schemaHostGroupOperation,
  schemaHostGroupSummary,
} from '../rules/schema';

function memberCountOf(raw: DTOs.HostGroupV1) {
  if (Number.isFinite(raw.member_count)) {
    return Number(raw.member_count);
  }

  return raw.members?.length ?? 0;
}

function clusterOf(raw: DTOs.HostGroupV1) {
  if (!raw.cluster) return undefined;

  return {
    id: raw.cluster.id,
    kind: raw.cluster.kind,
    engine: raw.cluster.engine || undefined,
    status: raw.cluster.status,
  };
}

export const toHostGroupSummary = createAdapter<
  DTOs.HostGroupV1,
  ReturnType<typeof schemaHostGroupSummary.parse>
>((raw) =>
  schemaHostGroupSummary.parse({
    id: String(raw.id),
    name: raw.name,
    description: raw.description || undefined,
    workspaceId: raw.workspace_id || undefined,
    workspaceType: raw.workspace_type || undefined,
    memberCount: memberCountOf(raw),
    cluster: clusterOf(raw),
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
  }),
);

export const toHostGroupDetail = createAdapter<
  DTOs.HostGroupV1,
  ReturnType<typeof schemaHostGroupDetail.parse>
>((raw) =>
  schemaHostGroupDetail.parse({
    id: String(raw.id),
    name: raw.name,
    description: raw.description || undefined,
    workspaceId: raw.workspace_id || undefined,
    workspaceType: raw.workspace_type || undefined,
    memberCount: memberCountOf(raw),
    cluster: clusterOf(raw),
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
    members: (raw.members ?? []).map((member) => ({
      id: String(member.id ?? ''),
      hostname: member.hostname ?? '',
      address: member.address || undefined,
      status: member.status || undefined,
      provider: member.provider || undefined,
      region: member.region || undefined,
      currentHostGroupId: member.host_group_id || undefined,
    })),
  }),
);

export const toHostGroupOperation = createAdapter<
  DTOs.HostGroupOperationDetailV1,
  ReturnType<typeof schemaHostGroupOperation.parse>
>((raw) => {
  const operation = raw.operation;
  const requestedAction =
    typeof operation.request.action === 'string'
      ? operation.request.action.trim()
      : '';

  return schemaHostGroupOperation.parse({
    id: operation.id,
    hostGroupId: operation.host_group_id,
    type: operation.type,
    action: requestedAction || operation.type,
    status: operation.status,
    request: operation.request,
    targetCount: operation.target_count,
    succeededCount: operation.succeeded_count,
    failedCount: operation.failed_count,
    timestamp: {
      created: operation.created_at,
      updated: operation.updated_at,
    },
    targets: raw.targets.map((target) => ({
      id: target.id,
      serverId: target.machine_id,
      status: target.status,
      error: target.error || undefined,
      executionId: target.execution_id || undefined,
      deploymentId: target.deployment_id || undefined,
      agentCommandId: target.agent_command_id || undefined,
    })),
  });
});
