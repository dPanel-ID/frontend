// =============================================================================
//
//     Data Transfer Object ()
//
// =============================================================================

import type { ArtifactV1, DeployV1, OrganizationV1 } from '.';

export interface ApplicationV1 {
  id?: number;
  name?: string;
  workdir?: string;
  domain?: string;
  source?: string;
  source_type?: string;
  type?: string;
  framework?: string;
  bundle_type?: string;
  default_branch?: string;
  repo_org?: string;
  repo_name?: string;
  repo_url?: string;
  owner?: number;
  owner_provider?: string;
  owner_subject?: string;
  workspace_id?: string;
  workspace_type?: string;
  organization_id?: string;
  organization?: OrganizationV1;
  user_id?: number;
  user?: {
    id?: number;
    username?: string;
    fullname?: string;
    email?: string;
  };
  meta_file?: string;
  created_at?: string;
  updated_at?: string;
  deploys?: DeployV1[];
  artifacts?: ArtifactV1[];
  deploy?: DeployV1;
  artifact?: ArtifactV1;
  app_definition?: AppDefinition;
  app_config?: AppConfig;
  playbook?: ApplicationPlaybookPayloadV1;
  runtime_items?: ApplicationIACRuntimeItemV1[];
}

export interface ApplicationPayloadV1 {
  app_config?: AppConfig;
  app_definition?: AppDefinition;
  artifact?: ArtifactV1 & Record<string, unknown>;
  bootstrap?: boolean;
  default_branch?: string;
  deploy?: DeployV1 & Record<string, unknown>;
  domain?: string;
  framework?: string;
  id?: number;
  name?: string;
  owner_provider?: string;
  owner_subject?: string;
  playbook?: ApplicationPlaybookPayloadV1;
  repo_name?: string;
  repo_org?: string;
  repo_url?: string;
  runtime_items?: ApplicationIACRuntimeItemV1[];
  source?: string;
  type?: string;
  workdir?: string;
  workspace_id?: string;
  workspace_type?: string;
}

export interface ApplicationIACConfigV1 {
  application_id: string;
  workspace: ApplicationIACWorkspaceV1;
  repository: ApplicationIACRepositoryV1;
  generated_playbook: ApplicationIACGeneratedPlaybookV1;
  pipeline: ApplicationIACPipelineV1;
  runtime_items: ApplicationIACRuntimeItemV1[];
  warnings?: string[];
}

export interface ApplicationIACWorkspaceV1 {
  id: string;
  type: string;
  user_id?: string;
  group_id?: string;
}

export interface ApplicationIACRepositoryV1 {
  owner: string;
  repo: string;
  ref: string;
  resolved_commit?: string;
}

export interface ApplicationIACGeneratedPlaybookV1 {
  path: string;
  exists: boolean;
  content?: string;
  sha?: string;
}

export interface ApplicationIACPipelineV1 {
  bootstrap?: ApplicationIACBootstrapPlaybookV1[];
  deploy?: ApplicationIACDeployPlaybookV1;
}

export interface ApplicationIACBootstrapPlaybookV1 {
  module: string;
  title?: string;
  version?: string;
  import_playbook: string;
  when?: string;
  roles?: string[];
  variables?: Record<string, unknown>;
  installation_key?: string;
  source?: string;
  module_ref?: string;
  module_source_commit?: string;
}

export interface ApplicationIACDeployPlaybookV1 {
  import_playbook?: string;
}

export interface ApplicationIACRuntimeItemV1 {
  name: string;
  title?: string;
  version?: string;
  category?: string;
  roles?: string[];
  variables?: Record<string, unknown>;
  installation_key?: string;
  source?: string;
  module_ref?: string;
  module_source_commit?: string;
}

export interface ApplicationPlaybookPayloadV1 {
  id?: number;
  machine_id?: number;
  name?: string;
  tag?: string;
  roles?: ApplicationPlaybookRolePayloadV1[];
}

export interface ApplicationPlaybookRolePayloadV1 {
  id?: number;
  name?: string;
  tag?: string;
  variable?: Record<string, unknown>;
  save_not_allowed_var?: string[];
}

export interface ApplicationLogEntryV1 {
  time?: string | number;
  line?: string | null;
  severity?: string;
  attributes?: Record<string, unknown> | null;
}

export interface ApplicationLogsV1 {
  source?: string;
  application_id?: string;
  artifact_id?: string;
  deployment_id?: string;
  machine_id?: string;
  file_path?: string;
  event_type?: string;
  time_gte?: string;
  time_lt?: string;
  limit?: number;
  /** 1-based page within the window, newest first. */
  page?: number;
  /** Lines in the whole window, when the log store reports it. */
  total?: number;
  has_more?: boolean;
  lines?: Array<string | null> | null;
  entries?: Array<ApplicationLogEntryV1 | null> | null;
  query?: string;
  query_errors?: string[] | null;
}

export type ApplicationLogViewerResponseV1 = ApplicationLogsV1;

export type ApplicationLogsResponseV1 = ApplicationLogsV1 | string[];

export interface AppDefinition {
  version?: string;
  setup?: {
    framework?: string;
    language?: {
      name?: string;
      version?: string | number;
    };
    languages?: Array<{
      name?: string;
      version?: string | number;
    }>;
    router?: unknown;
  };
  build?: {
    /** Bounds the whole deployment job, as a Go duration such as "90m". */
    timeout?: string;
    target?: {
      machine?: {
        workdir?: string;
        workir?: string;
        steps?: Array<{
          name?: string;
          cmd?: unknown;
          command?: string[];
          archive?: string[];
        }>;
        environment?: Array<{
          key: string;
          value: string;
        }>;
      };
    };
  };
  run?: {
    name?: string;
    description?: string;
    command?: string;
    port?: number;
    no_service?: boolean;
    reload?: string;
    environment?: Array<{
      key: string;
      value: string;
    }>;
    config?: Array<{
      key: string;
      value: string;
    }> | null;
  };
}

interface AppConfig {
  auto_deploy?: AutoDeploy;
  /** Where the application's languages come from: the new or previous runtime. */
  runtime?: 'new' | 'previous';
}

interface AutoDeploy {
  enabled?: boolean;
  branch?: string;
}

export type BuildProgressStatusV1 =
  | 'none'
  | 'waiting'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'skipped';

export interface BuildStepV1 {
  name: string;
  status: BuildProgressStatusV1;
  started_at: string;
  finished_at?: string;
}

export interface BuildStageV1 {
  key: string;
  kind: 'setup' | 'source' | 'prepare' | 'build_step' | 'package' | 'deploy';
  /** The build step's own name, on build_step stages. */
  name?: string;
  status: BuildProgressStatusV1;
  started_at: string;
  finished_at?: string;
  steps: BuildStepV1[];
}

export interface BuildProgressV1 {
  execution_id?: string;
  status: BuildProgressStatusV1;
  stages: BuildStageV1[];
}
