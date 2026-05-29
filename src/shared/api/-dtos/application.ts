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
  bundle_type?: string;
  default_branch?: string;
  repo_org?: string;
  repo_name?: string;
  repo_url?: string;
  owner?: number;
  organization_id?: string;
  organization?: OrganizationV1;
  user_id?: number;
  user?: {
    username: string;
    fullname: string;
  };
  created_at?: string;
  updated_at?: string;
  deploys?: DeployV1[];
  artifacts?: ArtifactV1[];
  app_definition?: AppDefinition;
  app_config?: AppConfig;
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
  lines?: Array<string | null> | null;
  entries?: Array<ApplicationLogEntryV1 | null> | null;
  query?: string;
  query_errors?: string[] | null;
}

export type ApplicationLogsResponseV1 = ApplicationLogsV1 | string[];

export interface AppDefinition {
  version: string;
  setup?: {
    language?: {
      name?: string;
      version?: string | number;
    };
    languages?: Array<{
      name?: string;
      version?: string | number;
    }>;
    router: unknown;
  };
  build?: {
    target?: {
      machine?: {
        workdir?: string;
        steps?: Array<{
          name?: string;
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
    environment?: Array<{
      key: string;
      value: string;
    }>;
    config: null;
  };
}

interface AppConfig {
  auto_deploy?: AutoDeploy;
}

interface AutoDeploy {
  enabled?: boolean;
  branch?: string;
}
