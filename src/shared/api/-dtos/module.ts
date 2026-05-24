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

export interface IACRepositoryV1 {
  provider: string;
  owner: string;
  repo: string;
  default_ref: string;
  ref_type: string;
  ref_name: string;
  resolved_commit: string;
  source: string;
  status: string;
}

export interface ModuleCatalogItemV1 {
  id: string;
  name: string;
  description?: string;
  category?: string;
  platforms?: string[];
  icon?: string;
  supported: boolean;
  unsupported_reasons?: string[];
  actions?: string[];
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
