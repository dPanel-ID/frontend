import { z } from 'zod';

export const schemaExplicitTarget = z.object({
  type: z.enum(['server', 'hostgroup']),
  id: z.string().min(1),
});

export const schemaHostGroupActionTargetDto = z.object({
  type: z.string().optional(),
  id: z.string().optional(),
});

export const schemaHostGroupDto = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  workspace_id: z.string().optional(),
  workspace_type: z.string().optional(),
  member_count: z.number().optional(),
  members: z.array(z.record(z.string(), z.unknown())).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schemaHostGroupOperationDto = z.object({
  id: z.string().optional(),
  host_group_id: z.string().optional(),
  workspace_id: z.string().optional(),
  workspace_type: z.string().optional(),
  actor_subject: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  request: z.record(z.string(), z.unknown()).optional(),
  target_count: z.number().optional(),
  succeeded_count: z.number().optional(),
  failed_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schemaHostGroupOperationTargetDto = z.object({
  id: z.string().optional(),
  operation_id: z.string().optional(),
  machine_id: z.string().optional(),
  execution_id: z.string().optional(),
  agent_command_id: z.string().optional(),
  deployment_id: z.string().optional(),
  status: z.string().optional(),
  error: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const schemaHostGroupOperationDetailDto = z.object({
  operation: schemaHostGroupOperationDto.optional(),
  targets: z.array(schemaHostGroupOperationTargetDto).optional(),
});

export const schemaHostGroupActionResponseDto = z.object({
  operation_id: z.string().optional(),
  status: z.string().optional(),
  action: z.string().optional(),
  command_type: z.string().optional(),
  target_count: z.number().optional(),
  succeeded_count: z.number().optional(),
  failed_count: z.number().optional(),
  target: schemaHostGroupActionTargetDto.optional(),
});

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
