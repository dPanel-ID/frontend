import { z } from 'zod';

const schemaScopedExecutionStatus = z.enum([
  'pending',
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
]);

const schemaHostGroupOperationStatus = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
]);

const schemaCommandStatus = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'expired',
]);

const schemaHostGroupOperationType = z.enum([
  'module.install',
  'module.action',
  'application.deploy',
  'module.inventory',
  'agent.upgrade',
  'system.reboot',
]);

const schemaHostGroupBulkAction = z.enum(['inventory', 'upgrade', 'reboot']);

const schemaHostGroupBulkCommandType = z.enum([
  'module.inventory',
  'agent.upgrade',
  'system.reboot',
]);

const schemaExecutionErrorDetail = z
  .object({
    action: z.string().optional(),
    command: z.string().optional(),
    detail: z.string().optional(),
    event_type: z.string().optional(),
    execution_id: z.string().optional(),
    exit_code: z.number().nullable().optional(),
    host: z.string().optional(),
    machine_id: z.string().optional(),
    message: z.string().optional(),
    module: z.string().optional(),
    module_id: z.string().optional(),
    organization_id: z.string().optional(),
    play: z.string().optional(),
    playbook: z.string().optional(),
    role: z.string().optional(),
    stderr: z.string().optional(),
    stdout: z.string().optional(),
    summary: z.string().optional(),
    task: z.string().optional(),
    task_path: z.string().optional(),
    traceparent: z.string().optional(),
    type: z.string().optional(),
  })
  .strict();

const schemaUserPublic = z
  .object({
    id: z.string().optional(),
    username: z.string().optional(),
    fullname: z.string().optional(),
    email: z.string().optional(),
    register_from: z.string().optional(),
    avatar_url: z.string().optional(),
    actived_at: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

const schemaOrganizationPublic = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    user_id: z.string().optional(),
    user: schemaUserPublic.optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    error: z.string().optional(),
    status: z.string().optional(),
  })
  .strict();

const schemaMachineWorkspace = z
  .object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    roles: z.array(z.string()).optional(),
  })
  .strict();

const schemaMachineAgent = z
  .object({
    upgrade_available: z.boolean().optional(),
    new_version: z.string().optional(),
  })
  .strict();

const schemaMachineOperatingSystemInfo = z
  .object({
    key: z.string().optional(),
    value: z.string().optional(),
  })
  .strict();

const schemaMachineDisk = z
  .object({
    device: z.string().optional(),
    fstype: z.string().optional(),
    mountpoint: z.string().optional(),
    opts: z.array(z.string()).optional(),
  })
  .strict();

const schemaMachinePort = z
  .object({
    allow_from: z.string().optional(),
    port: z.number().optional(),
    process_id: z.number().optional(),
    process_name: z.string().optional(),
    state: z.string().optional(),
  })
  .strict();

const schemaMachineNetworkInterfaceData = z
  .object({
    address: z.string().optional(),
    ip_v4: z.string().optional(),
    ip_v6: z.string().optional(),
    is_global_unicast: z.boolean().optional(),
    is_interface_local_multicast: z.boolean().optional(),
    is_link_local_multicast: z.boolean().optional(),
    is_link_local_unicast: z.boolean().optional(),
    is_loopback: z.boolean().optional(),
    is_multicast: z.boolean().optional(),
    subnet: z.string().optional(),
  })
  .strict();

const schemaMachineNetworkInterface = z
  .object({
    interface_name: z.string().optional(),
    interface_data: z.array(schemaMachineNetworkInterfaceData).optional(),
  })
  .strict();

export const schemaExplicitTarget = z
  .object({
    type: z.enum(['server', 'hostgroup']),
    id: z.string().min(1),
  })
  .strict();

export const schemaHostGroupActionTargetDto = z
  .object({
    type: z.literal('hostgroup'),
    id: z.string().min(1),
  })
  .strict();

export const schemaHostGroupMemberDto = z
  .object({
    id: z.string().min(1),
    hostname: z.string(),
    address: z.string().optional(),
    http_port: z.string().optional(),
    ssh_port: z.string().optional(),
    secret_id: z.string().optional(),
    organization: schemaOrganizationPublic.optional(),
    user: schemaUserPublic.optional(),
    owner_subject: z.string().optional(),
    workspace_id: z.string().optional(),
    workspace_type: z.string().optional(),
    host_group_id: z.string().optional(),
    workspace: schemaMachineWorkspace.optional(),
    cloud_id: z.string().optional(),
    source: z.string().optional(),
    provider: z.string().optional(),
    region_id: z.string().optional(),
    region: z.string().optional(),
    default_user: z.string().optional(),
    token: z.string().optional(),
    token_version: z.string().optional(),
    agent_version: z.string().optional(),
    agent: schemaMachineAgent.optional(),
    router_version: z.string().optional(),
    distributor: z.string().optional(),
    version: z.string().optional(),
    os_family: z.string().optional(),
    os_codename: z.string().optional(),
    os_arch: z.string().optional(),
    kernel_name: z.string().optional(),
    kernel_version: z.string().optional(),
    inventory_refreshed_at: z.string().optional(),
    os_info: z.array(schemaMachineOperatingSystemInfo).optional(),
    disks: z.array(schemaMachineDisk).optional(),
    ports: z.array(schemaMachinePort).optional(),
    network_interfaces: z.array(schemaMachineNetworkInterface).optional(),
    status: z.string().optional(),
    error: z.string().optional(),
    error_detail: schemaExecutionErrorDetail.nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

export const schemaHostGroupSummaryDto = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    workspace_id: z.string().min(1),
    workspace_type: z.string().min(1),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .strict();

export const schemaHostGroupDetailDto = schemaHostGroupSummaryDto
  .extend({
    members: z.array(schemaHostGroupMemberDto),
  })
  .strict();

export const schemaHostGroupOperationDto = z
  .object({
    id: z.string().min(1),
    host_group_id: z.string().min(1),
    workspace_id: z.string().min(1),
    workspace_type: z.string().min(1),
    actor_subject: z.string().optional(),
    retry_of_operation_id: z.string().optional(),
    type: schemaHostGroupOperationType,
    status: schemaHostGroupOperationStatus,
    request: z.record(z.string(), z.unknown()),
    target_count: z.number().int().nonnegative(),
    succeeded_count: z.number().int().nonnegative(),
    failed_count: z.number().int().nonnegative(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .strict();

export const schemaHostGroupOperationTargetDto = z
  .object({
    id: z.string().min(1),
    operation_id: z.string().min(1),
    machine_id: z.string().min(1),
    retry_of_target_id: z.string().optional(),
    execution_id: z.string().optional(),
    agent_command_id: z.string().optional(),
    deployment_id: z.string().optional(),
    status: schemaHostGroupOperationStatus,
    error: z.string().optional(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .strict();

export const schemaHostGroupOperationDetailDto = z
  .object({
    operation: schemaHostGroupOperationDto,
    targets: z.array(schemaHostGroupOperationTargetDto),
  })
  .strict();

const schemaHostGroupBulkActionBase = {
  operation_id: z.string().min(1),
  status: schemaHostGroupOperationStatus,
  target_count: z.number().int().nonnegative(),
  succeeded_count: z.number().int().nonnegative(),
  failed_count: z.number().int().nonnegative(),
  target: schemaHostGroupActionTargetDto,
} as const;

export const schemaHostGroupActionResponseDto = z.discriminatedUnion('action', [
  z
    .object({
      ...schemaHostGroupBulkActionBase,
      action: z.literal('inventory'),
      command_type: z.literal('module.inventory'),
    })
    .strict(),
  z
    .object({
      ...schemaHostGroupBulkActionBase,
      action: z.literal('upgrade'),
      command_type: z.literal('agent.upgrade'),
    })
    .strict(),
  z
    .object({
      ...schemaHostGroupBulkActionBase,
      action: z.literal('reboot'),
      command_type: z.literal('system.reboot'),
    })
    .strict(),
]);

const schemaIacRepositoryActiveRef = z
  .object({
    type: z.string().min(1),
    name: z.string().min(1),
    resolved_commit: z.string().optional(),
    last_synced_commit: z.string().optional(),
  })
  .strict();

export const schemaIacRepositoryResponseDto = z
  .object({
    id: z.string().optional(),
    workspace_id: z.string().min(1),
    workspace_type: z.string().min(1),
    mode: z.string().min(1),
    provider: z.string().min(1),
    owner: z.string().min(1),
    repo: z.string().min(1),
    default_branch: z.string().min(1),
    active_ref: schemaIacRepositoryActiveRef,
    status: z.string().min(1),
    error: z.string().optional(),
  })
  .strict();

export const schemaHostGroupModuleActionResponseDto = z
  .object({
    operation_id: z.string().min(1),
    status: schemaHostGroupOperationStatus,
    module: z.string().min(1),
    action: z.string().min(1),
    target: schemaHostGroupActionTargetDto,
    repository: schemaIacRepositoryResponseDto,
  })
  .strict();

export const schemaHostGroupDeploymentActionResponseDto = z
  .object({
    operation_id: z.string().min(1),
    status: z.literal('queued'),
    target: schemaHostGroupActionTargetDto,
  })
  .strict();

export type ExplicitTarget = z.infer<typeof schemaExplicitTarget>;
export type HostGroupActionTargetDto = z.infer<
  typeof schemaHostGroupActionTargetDto
>;
export type HostGroupSummaryDto = z.infer<typeof schemaHostGroupSummaryDto>;
export type HostGroupDetailDto = z.infer<typeof schemaHostGroupDetailDto>;
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
export type HostGroupModuleActionResponseDto = z.infer<
  typeof schemaHostGroupModuleActionResponseDto
>;
export type HostGroupDeploymentActionResponseDto = z.infer<
  typeof schemaHostGroupDeploymentActionResponseDto
>;
export type HostGroupExecutionStatus = z.infer<
  typeof schemaHostGroupOperationStatus
>;
export type HostGroupCommandStatus = z.infer<typeof schemaCommandStatus>;

export {
  schemaCommandStatus,
  schemaExecutionErrorDetail,
  schemaHostGroupOperationStatus,
  schemaHostGroupBulkAction,
  schemaHostGroupBulkCommandType,
  schemaHostGroupOperationType,
  schemaScopedExecutionStatus,
};
