// =============================================================================
//
//     Data Transfer Object ()
//
// =============================================================================

import type {
  ExecutionErrorDetailV1,
  OrganizationV1,
  UserPublicContactV1,
} from '.';

export interface MachineAgentV1 {
  id?: string;
  machine_id?: string;
  new_version?: string;
  upgrade_available?: boolean;
  token?: string;
  version?: string;
  status?: string;
  last_heartbeat_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MachineDiskV1 {
  device?: string;
  fstype?: string;
  mountpoint?: string;
  opts?: string[];
}

export interface MachineNetworkInterfaceDataV1 {
  address?: string;
  ip_v4?: string;
  ip_v6?: string;
  is_global_unicast?: boolean;
  is_interface_local_multicast?: boolean;
  is_link_local_multicast?: boolean;
  is_link_local_unicast?: boolean;
  is_loopback?: boolean;
  is_multicast?: boolean;
  subnet?: string;
}

export interface MachineNetworkInterfaceV1 {
  interface_data?: MachineNetworkInterfaceDataV1[];
  interface_name?: string;
}

export interface MachineOperatingSystemInfoV1 {
  key?: string;
  value?: string;
}

export interface MachinePortInUsedV1 {
  allow_from?: string;
  port?: number;
  process_id?: number;
  process_name?: string;
  state?: string;
}

export interface MachineUserV1 {
  comment?: string;
  created_at?: string;
  error?: string;
  gid?: number;
  group?: string;
  home?: string;
  home_dir?: string;
  id?: number;
  installer?: string;
  installer_status?: string;
  machine_id?: number;
  password?: string;
  shell?: string;
  uid?: number;
  updated_at?: string;
  user_id?: number;
  username?: string;
}

export interface MachineV1 {
  id?: number | string;
  hostname?: string;
  address?: string;
  /** `public` (reached over SSH) or `private` (no public IP; reached only through its agent). */
  connectivity?: 'public' | 'private' | string;
  /** A private server's own LAN address, for display only. */
  lan_address?: string;
  http_port?: string;
  ssh_port?: string;
  organization_id?: string;
  organization?: OrganizationV1;
  user_id?: number | string;
  user?: UserPublicContactV1;
  cloud_id?: string;
  cloud_project_id?: string;
  source?: string;
  provider?: string;
  region_id?: string;
  region?: string;
  owner_provider?: string;
  owner_subject?: string;
  workspace_id?: string;
  workspace_type?: string;
  host_group_id?: string;
  workspace?: MachineWorkspaceV1;
  default_user?: string;
  agent?: MachineAgentV1;
  agent_version?: string;
  token?: string;
  token_version?: string;
  secret_id?: string;
  secret?: unknown;
  distributor?: string;
  version?: string;
  router_version?: string;
  os_family?: string;
  os_codename?: string;
  os_arch?: string;
  os_info?: MachineOperatingSystemInfoV1[];
  kernel_name?: string;
  kernel_version?: string;
  disks?: MachineDiskV1[];
  network_interfaces?: MachineNetworkInterfaceV1[];
  ports?: MachinePortInUsedV1[];
  inventory_refreshed_at?: string;
  domain?: string;
  status?: string;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  created_at?: string;
  updated_at?: string;
}

export interface MachineWorkspaceV1 {
  id?: string;
  name?: string;
  roles?: string[];
  type?: string;
}

export interface ServerLogEntryV1 {
  attributes?: Record<string, unknown>;
  line?: string;
  severity?: string;
  time?: string;
}

export interface ServerLogViewerV1 {
  application_id?: string;
  artifact_id?: string;
  deployment_id?: string;
  entries?: ServerLogEntryV1[];
  event_type?: string;
  file_path?: string;
  limit?: number;
  lines?: string[];
  machine_id?: string;
  query?: string;
  query_errors?: string[];
  source?: string;
  time_gte?: string;
  time_lt?: string;
}
