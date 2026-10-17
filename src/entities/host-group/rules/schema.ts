import { z } from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

import { schemaExplicitTarget } from '@/shared/rules/host-group';

export type Target = z.output<typeof schemaExplicitTarget>;
export const schemaTarget = schemaExplicitTarget;

export type HostGroupSummary = z.output<typeof schemaHostGroupSummary>;
export const schemaHostGroupSummary = z.object({
  id: SchemaCommon.unitId,
  name: z.string(),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
  workspaceType: z.string().optional(),
  memberCount: z.number().int().nonnegative(),
  timestamp: SchemaCommon.timestamp,
});

export type HostGroupMember = z.output<typeof schemaHostGroupMember>;
export const schemaHostGroupMember = z.object({
  id: SchemaCommon.unitId,
  hostname: z.string(),
  address: z.string().optional(),
  status: z.string().optional(),
  provider: z.string().optional(),
  region: z.string().optional(),
  currentHostGroupId: z.string().optional(),
});

export type HostGroupDetail = z.output<typeof schemaHostGroupDetail>;
export const schemaHostGroupDetail = schemaHostGroupSummary.extend({
  members: z.array(schemaHostGroupMember),
});

export type HostGroupOperationTarget = z.output<
  typeof schemaHostGroupOperationTarget
>;
export const schemaHostGroupOperationTarget = z.object({
  id: SchemaCommon.unitId,
  serverId: SchemaCommon.unitId,
  status: z.string(),
  error: z.string().optional(),
  executionId: z.string().optional(),
  deploymentId: z.string().optional(),
  agentCommandId: z.string().optional(),
});

export type HostGroupOperation = z.output<typeof schemaHostGroupOperation>;
export const schemaHostGroupOperation = z.object({
  id: SchemaCommon.unitId,
  hostGroupId: SchemaCommon.unitId,
  type: z.string(),
  action: z.string(),
  status: z.string(),
  request: z.record(z.string(), z.unknown()).default({}),
  targetCount: z.number().int().nonnegative(),
  succeededCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  timestamp: SchemaCommon.timestamp,
  targets: z.array(schemaHostGroupOperationTarget),
});
