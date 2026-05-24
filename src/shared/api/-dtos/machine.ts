// =============================================================================
//
//     Data Transfer Object ()
//
// =============================================================================

import type { OrganizationV1, User } from '.';

export interface MachineV1 {
  id?: number;
  hostname?: string;
  address?: string;
  http_port?: string;
  ssh_port?: string;
  organization_id?: string;
  organization?: OrganizationV1;
  user_id?: number;
  user?: User;
  cloud_id?: string;
  source?: string;
  provider?: string;
  region_id?: string;
  region?: string;
  default_user?: string;
  agent_version?: string;
  token?: string;
  token_version?: string;
  secret_id?: string;
  distributor?: string;
  version?: string;
  os_family?: string;
  os_codename?: string;
  os_arch?: string;
  kernel_name?: string;
  kernel_version?: string;
  inventory_refreshed_at?: string;
  domain?: string;
  status?: string;
  error?: string;
  created_at?: string;
  updated_at?: string;
}
