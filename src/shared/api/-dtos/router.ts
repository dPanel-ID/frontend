import type { ExecutionErrorDetailV1 } from './execution-error-detail';
import type { MachineV1 } from './machine';
import type { OrganizationV1 } from './organization';
import type { UserPublicContactV1 } from './user';

export interface InputRouterV1 {
  id?: string | number;
  engine?: string;
  type?: string;
  name?: string;
  domain?: string;
  upstream?: string;
  advance_mode?: boolean;
  installer_status?: string;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  owner?: string | number;
  machine_id?: string | number;
}

export interface RouterRuleUpstreamV1 {
  address?: string;
  port?: string;
  scheme?: string;
  /** Server of the application deployment, on resolved upstreams only. */
  machine_id?: string;
}

export interface RouterRuleTargetV1 {
  application_id?: string;
  /** How an application target is reached; empty means private (legacy). */
  address_mode?: 'registered' | 'private' | 'custom' | '';
  upstreams?: RouterRuleUpstreamV1[];
  /** Where an application target went at the last apply (read-only). */
  resolved_upstreams?: RouterRuleUpstreamV1[];
}

export interface RouterRuleV1 {
  type?: string;
  path_match?: string;
  wildcard?: boolean;
  target?: RouterRuleTargetV1;
}

export interface RouterConfigV1 {
  domain?: {
    cloudflare?: {
      proxied?: boolean;
    };
    id?: string;
    subdomain?: string;
    ttl?: number;
  };
  lb_kind?: 'l4' | 'l7';
  protocol?: string;
  ssl_enabled?: boolean;
}

export interface RouterV1 {
  id?: string | number;
  engine?: string;
  type?: string;
  name?: string;
  domain?: string;
  domain_l4?: string;
  upstream?: string;
  default_upstream?: string;
  port_l4?: string;
  advance_mode?: boolean;
  organization_id?: string;
  organization?: OrganizationV1;
  workspace_id?: string;
  workspace_type?: string;
  owner_provider?: string;
  owner_subject?: string;
  iac_owner?: string;
  iac_provider?: string;
  iac_ref_commit?: string;
  iac_ref_name?: string;
  iac_repo?: string;
  playbook_path?: string;
  user_id?: string | number;
  user?: UserPublicContactV1;
  machine_id?: string | number;
  installer_status?: string;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  created_at?: string;
  updated_at?: string;
  machine?: MachineV1;
  config?: RouterConfigV1;
  rules?: RouterRuleV1[];
}
