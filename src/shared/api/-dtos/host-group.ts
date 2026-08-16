import type { MachineV1 } from '.';

export interface HostGroupV1 {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  workspace_type?: string;
  member_count?: number;
  members?: MachineV1[];
  created_at?: string;
  updated_at?: string;
}

export interface HostGroupOperationV1 {
  id?: string;
  host_group_id?: string;
  workspace_id?: string;
  workspace_type?: string;
  actor_subject?: string;
  type?: string;
  status?: string;
  request?: Record<string, unknown>;
  target_count?: number;
  succeeded_count?: number;
  failed_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HostGroupOperationTargetV1 {
  id?: string;
  operation_id?: string;
  machine_id?: string;
  execution_id?: string;
  agent_command_id?: string;
  deployment_id?: string;
  status?: string;
  error?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HostGroupOperationDetailV1 {
  operation?: HostGroupOperationV1;
  targets?: HostGroupOperationTargetV1[];
}

export interface HostGroupActionTargetV1 {
  type?: string;
  id?: string;
}

export interface HostGroupActionResponseV1 {
  operation_id?: string;
  status?: string;
  action?: string;
  command_type?: string;
  target_count?: number;
  succeeded_count?: number;
  failed_count?: number;
  target?: HostGroupActionTargetV1;
}
