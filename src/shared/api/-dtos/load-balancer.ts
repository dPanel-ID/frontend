// =============================================================================
//
//     Data Transfer Object ()
//
// =============================================================================

import type {
  ApplicationIACGeneratedPlaybookV1,
  ApplicationIACPipelineV1,
  ApplicationIACRepositoryV1,
  ApplicationIACRuntimeItemV1,
  ApplicationIACWorkspaceV1,
} from './application';
import type { ExecutionErrorDetailV1 } from './execution-error-detail';
import type { MachineV1 } from './machine';
import type { OrganizationV1 } from './organization';
import type { UserPublicContactV1 } from './user';

export type LoadBalancerIdV2 = string | number;

export interface LoadBalancerRuleUpstreamV2 {
  address?: string;
  port?: string;
  scheme?: string;
  /** Server of the application deployment, on resolved upstreams only. */
  machine_id?: string;
}

export type LoadBalancerAddressModeV2 = 'registered' | 'private' | 'custom';

export interface LoadBalancerRuleV2 {
  path_match?: string;
  type?: string;
  wildcard?: boolean;
  target?: {
    application_id?: string;
    /** How an application target is reached; empty means private (legacy). */
    address_mode?: LoadBalancerAddressModeV2 | '';
    upstreams?: LoadBalancerRuleUpstreamV2[];
    /** Where an application target went at the last apply (read-only). */
    resolved_upstreams?: LoadBalancerRuleUpstreamV2[];
  };
}

export interface LoadBalancerConfigV2 {
  domain?: {
    cloudflare?: {
      proxied?: boolean;
    };
    id?: string;
    subdomain?: string;
    ttl?: number;
  };
  lb_kind?: string;
  protocol?: string;
  ssl_enabled?: boolean;
  /** The listener of an L4 load balancer. */
  l4?: {
    listen_address?: string;
    listen_port?: number;
    service?: string;
    balance?: string;
    allow_from?: string[];
    idle_timeout?: string;
  };
}

export interface LoadBalancerV2 {
  id?: LoadBalancerIdV2;
  name?: string;
  domain?: string;
  domain_l4?: string;
  engine?: string;
  type?: string;
  upstream?: string;
  default_upstream?: string;
  port_l4?: string;
  machine_id?: string | number;
  workspace_id?: string;
  workspace_type?: string;
  owner_provider?: string;
  owner_subject?: string;
  advance_mode?: boolean;
  config?: LoadBalancerConfigV2;
  rules?: LoadBalancerRuleV2[];
  organization_id?: string;
  organization?: OrganizationV1;
  iac_owner?: string;
  iac_provider?: string;
  iac_ref_commit?: string;
  iac_ref_name?: string;
  iac_repo?: string;
  playbook_path?: string;
  user_id?: string | number;
  user?: UserPublicContactV1;
  installer_status?: string;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  created_at?: string;
  updated_at?: string;
  machine?: MachineV1;
}

export interface LoadBalancerLogEntryV2 {
  time?: string | number;
  line?: string | null;
  severity?: string;
  attributes?: Record<string, unknown> | null;
}

export interface LoadBalancerLogsV2 {
  load_balancer_id: string;
  machine_id: string;
  engine: string;
  domain: string;
  file_path: string;
  time_gte: string;
  time_lt: string;
  limit: number;
  /** 1-based page within the window, newest first. */
  page?: number;
  /** Lines in the whole window, when the log store reports it. */
  total?: number;
  has_more?: boolean;
  lines?: Array<string | null> | null;
  entries?: LoadBalancerLogEntryV2[] | null;
  query?: string;
  query_errors?: string[] | null;
}

export interface LoadBalancerIACConfigV2 {
  load_balancer_id: string;
  workspace: ApplicationIACWorkspaceV1;
  repository: ApplicationIACRepositoryV1;
  generated_playbook: ApplicationIACGeneratedPlaybookV1;
  pipeline: ApplicationIACPipelineV1;
  runtime_items: ApplicationIACRuntimeItemV1[];
  warnings?: string[];
}
