import type { ExecutionErrorDetailV1 } from './execution-error-detail';

export interface IACRepositoryRefV1 {
  type: string;
  name: string;
  resolved_commit: string;
}

export interface IACRepositorySummaryV1 {
  provider: string;
  owner: string;
  repo: string;
  ref: IACRepositoryRefV1;
}

export interface IACRepositoryActiveRefV1 {
  type?: string;
  name?: string;
  resolved_commit?: string;
}

export interface IACRepositoryV1 {
  id?: string;
  provider?: string;
  owner?: string;
  repo?: string;
  mode?: string;
  default_branch?: string;
  active_ref?: IACRepositoryActiveRefV1;
  workspace_id?: string;
  workspace_type?: string;
  status?: string;
  error?: string;

  default_ref?: string;
  ref_type?: string;
  ref_name?: string;
  resolved_commit?: string;
  source?: string;
}

export interface ModuleCatalogItemV1 {
  id: string;
  name: string;
  description?: string;
  category?: string;
  platforms?: string[];
  icon?: string;
  icon_url?: string;
  install_strategy?: string;
  instance_key?: {
    template?: string;
    fields?: string[];
  };
  supported: boolean;
  unsupported_reasons?: string[];
  actions?: string[];
  installation?: ModuleInstallationSummaryV1;
  installations?: ModuleInstallationSummaryV1[];
}

export interface ModuleInstallationSummaryV1 {
  installation_key?: string;
  install_strategy?: string;
  status: string;
  source?: string;
  module_ref?: string;
  module_commit?: string;
  module_source_commit?: string;
  variables_hash?: string;
  last_error?: string;
  last_error_detail?: ExecutionErrorDetailV1 | null;
  installed_at?: string;
  last_observed_at?: string;
  outdated?: boolean;
}

export interface ModuleInstallationV1 extends ModuleInstallationSummaryV1 {
  id: string;
  workspace_id?: string;
  scope_type: string;
  scope_id: string;
  machine_id?: string;
  hostgroup_id?: string;
  installation_key?: string;
  install_strategy?: string;
  inventory_path?: string;
  module_name: string;
  name: string;
  display_name?: string;
  module_source_owner?: string;
  module_source_repo?: string;
  module_source_ref?: string;
  playbook_path?: string;
  roles?: string[];
  variables?: Record<string, unknown>;
  last_execution_id?: string;
  last_command_id?: string;
  last_verified_at?: string;
  updated_at?: string;
}

export interface ServerModuleInventoryV1 {
  modules?: ModuleInstallationV1[];
  refreshed: boolean;
  observed_at?: string;
}

export interface ModuleSourceV1 {
  backend: string;
  roles?: string[];
  defaults?: string[];
}

export interface ModuleInputV1 {
  name: string;
  label: string;
  description?: string;
  type: string;
  required: boolean;
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  sensitive?: boolean;
  scope?: string;
  valid?: boolean;
}

export interface ModuleInputCatalogV1 {
  source: string;
  ref_type: string;
  ref_name: string;
  resolved_commit: string;
  hidden_invalid_aliases?: number;
}

export interface ModuleActionV1 {
  name: string;
  title: string;
  playbook: string;
  confirm?: boolean;
  risk?: string;
  roles?: string[];
}

export interface ModuleCatalogDetailV1 extends ModuleCatalogItemV1 {
  source: ModuleSourceV1;
  input_catalog: ModuleInputCatalogV1;
  action_details: ModuleActionV1[];
  inputs: ModuleInputV1[];
  manifest_path: string;
  alias_path?: string;
  resolved_commit: string;
}
