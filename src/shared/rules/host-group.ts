import { z } from 'zod';

export const schemaExplicitTarget = z.object({
  type: z.enum(['server', 'hostgroup']),
  id: z.string().min(1),
}).strict();

export const schemaHostGroupActionTargetDto = z.object({
  type: z.enum(['server', 'hostgroup']),
  id: z.string().min(1),
}).strict();

export const schemaHostGroupMemberDto = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    hostname: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
    host_group_id: z.string().optional(),
    workspace_id: z.string().optional(),
    workspace_type: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

export const schemaHostGroupDto = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  workspace_id: z.string().min(1),
  workspace_type: z.string().min(1),
  member_count: z.number().int().nonnegative(),
  members: z.array(schemaHostGroupMemberDto).optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
}).strict();

export const schemaHostGroupOperationDto = z.object({
  id: z.string().min(1),
  host_group_id: z.string().min(1),
  workspace_id: z.string().min(1),
  workspace_type: z.string().min(1),
  actor_subject: z.string().optional(),
  type: z.string().min(1),
  status: z.string().min(1),
  request: z.record(z.string(), z.unknown()),
  target_count: z.number().int().nonnegative(),
  succeeded_count: z.number().int().nonnegative(),
  failed_count: z.number().int().nonnegative(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
}).strict();

export const schemaHostGroupOperationTargetDto = z.object({
  id: z.string().min(1),
  operation_id: z.string().min(1),
  machine_id: z.string().min(1),
  execution_id: z.string().optional(),
  agent_command_id: z.string().optional(),
  deployment_id: z.string().optional(),
  status: z.string().min(1),
  error: z.string().optional(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
}).strict();

export const schemaHostGroupOperationDetailDto = z.object({
  operation: schemaHostGroupOperationDto,
  targets: z.array(schemaHostGroupOperationTargetDto),
}).strict();

export const schemaHostGroupActionResponseDto = z.object({
  operation_id: z.string().min(1),
  status: z.string().min(1),
  action: z.string().optional(),
  command_type: z.string().optional(),
  target_count: z.number().int().nonnegative().optional(),
  succeeded_count: z.number().int().nonnegative().optional(),
  failed_count: z.number().int().nonnegative().optional(),
  target: schemaHostGroupActionTargetDto,
}).strict();

export type ExplicitTarget = z.infer<typeof schemaExplicitTarget>;
export type HostGroupActionTargetDto = z.infer<
  typeof schemaHostGroupActionTargetDto
>;
export type HostGroupDto = z.infer<typeof schemaHostGroupDto>;
export type HostGroupOperationDto = z.infer<typeof schemaHostGroupOperationDto>;
export type HostGroupOperationTargetDto = z.infer<
  typeof schemaHostGroupOperationTargetDto
>;
export type HostGroupOperationDetailDto = z.infer<
  typeof schemaHostGroupOperationDetailDto
>;
export type HostGroupActionResponseDto = z.infer<
  typeof schemaHostGroupActionResponseDto
>;
