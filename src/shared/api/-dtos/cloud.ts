export interface CloudProjectV1 {
  id?: number | string;
  provider?: string;
  name?: string;
  owner?: number | string;
  error?: string;
  installer_status?: string;
  key_prefix?: string;
  owner_provider?: string;
  owner_subject?: string;
  workspace_id?: string;
  workspace_type?: string;
  workspace?: CloudProjectWorkspaceV1;
  credential?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  user?: {
    id?: number | string;
    fullname?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
  };
  organization?: {
    id?: string;
    name?: string;
  };
  organization_id?: string;
  user_id?: number | string;
}

export interface CloudProjectWorkspaceV1 {
  id?: string;
  name?: string;
  roles?: string[];
  type?: string;
}

export interface CloudProviderIconV1 {
  fallback?: string;
  type?: string;
  url?: string;
  value?: string;
}

export interface CloudProviderFieldOptionV1 {
  label?: string;
  value?: string;
}

export interface CloudProviderFieldV1 {
  advanced?: boolean;
  aliases?: string[];
  default?: unknown;
  depends_on?: string[];
  help?: string;
  key?: string;
  label?: string;
  options?: CloudProviderFieldOptionV1[];
  path?: string;
  placeholder?: string;
  required?: boolean;
  secret?: boolean;
  source_endpoint?: string;
  source_label_path?: string;
  source_value_path?: string;
  type?: string;
}

export interface CloudProviderPayloadContractV1 {
  credential_fields?: CloudProviderFieldV1[];
  example?: Record<string, unknown>;
  fields?: CloudProviderFieldV1[];
  method?: string;
  path?: string;
}

export interface CloudProviderVariableMappingV1 {
  help?: string;
  iac_path?: string;
  request_path?: string;
}

export interface CloudProviderResourceContractV1 {
  action?: string;
  contract_type?: string;
  example?: Record<string, unknown>;
  execution_backend?: string;
  fields?: CloudProviderFieldV1[];
  iac_role?: string;
  iac_state?: string;
  iac_variables_example?: Record<string, unknown>;
  notes?: string[];
  payload_path?: string;
  resource?: string;
  status?: string;
  variable_mapping?: CloudProviderVariableMappingV1[];
}

export interface CloudProviderContractV1 {
  aliases?: string[];
  capabilities?: string[];
  category?: string;
  documentation_url?: string;
  enabled?: boolean;
  iac_backends?: string[];
  icon?: CloudProviderIconV1;
  id?: string;
  name?: string;
  notes?: string[];
  payload_contract?: CloudProviderPayloadContractV1;
  resource_contracts?: CloudProviderResourceContractV1[];
}

export interface CloudProviderContractListV1 {
  project_fields?: CloudProviderFieldV1[];
  project_payload_example?: Record<string, unknown>;
  providers?: CloudProviderContractV1[];
}

/**
 * A VM dPanel created at a cloud provider that no longer belongs to a dPanel
 * server (GET /v1/cloud/project/detail/{id}/orphans).
 */
export interface CloudOrphanVmV1 {
  id?: string;
  name?: string;
  region?: string;
  /** GCP zone; deleting a GCP VM names its zone as the region. */
  zone?: string;
  state?: string;
  instance_type?: string;
  private_ip?: string;
  public_ip?: string;
  created_at?: string;
  tags?: Record<string, string> | null;
  /** Why the VM counts as dPanel-created, e.g. `tagged` or `legacy_name`. */
  evidence?: string;
  /** The dPanel server it belonged to, when its tags say so. */
  server_id?: string;
}

export interface CloudOrphanListV1 {
  cloud_id?: string;
  provider?: string;
  region?: string;
  items?: CloudOrphanVmV1[] | null;
}

export interface CloudOrphanDeleteResultV1 {
  execution_id?: string;
  cloud_id?: string;
  provider?: string;
  vm?: CloudOrphanVmV1;
}

/** The execution that deletes an orphan VM. */
export interface CloudOrphanExecutionV1 {
  id?: string;
  /** queued, running, succeeded or failed. */
  status?: string;
  error?: string;
  first_error_message?: string;
  last_event_message?: string;
  started_at?: string;
  finished_at?: string;
  created_at?: string;
  updated_at?: string;
}
