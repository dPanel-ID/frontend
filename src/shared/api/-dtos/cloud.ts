export interface CloudProjectV1 {
  id?: number;
  provider?: string;
  name?: string;
  owner?: number;
  error?: string;
  installer_status?: string;
  key_prefix?: string;
  owner_provider?: string;
  owner_subject?: string;
  workspace_id?: string;
  workspace_type?: string;
  credential?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  user?: {
    id?: number;
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
  user_id?: number;
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
