import type { ExecutionErrorDetailV1 } from './execution-error-detail';

export interface ServiceV1 {
  id?: number;
  installer_name?: string;
  installer_type?: string;
  installer_attributes?: Record<string, unknown>;
  installer_status?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  module?: ServiceModuleV1;
}

export interface ServiceModuleV1 {
  key?: string;
  type?: string;
  name?: string;
  version?: string;
  default?: boolean;
}

export interface ServiceOriginV1 {
  name: string;
  load: string;
  active: string;
  state: string;
  installer: string;
}

export interface ServiceOriginDetailV1 {
  name: string;
  description: string;
  file: string;
  load: string;
  active: string;
  state: string;
  installer: string;
  detail: string[];
}
