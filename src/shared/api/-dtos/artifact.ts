import type { AppDefinition } from './application';
import type { ExecutionErrorDetailV1 } from './execution-error-detail';
import type { MachineV1 } from './machine';

export interface ArtifactV1 {
  id?: number;
  branch?: string;
  description?: string;
  head?: string;
  meta_file?: string;
  git_host?: string;
  build_artifact?: boolean;
  installer_status?: string;
  is_primary?: boolean;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  file_url?: ApplicationArtifactFileURLV1 | null;
  app_definition?: AppDefinition;
  machine_id?: number;
  user_id?: number;
  /** Who ran the build, as a public profile (the API never sends email). */
  user?: {
    id?: number | string;
    username?: string;
    fullname?: string;
    email?: string;
    avatar_url?: string;
    created_at?: string;
  };
  application_id?: number;
  created_at?: string;
  updated_at?: string;
  machine?: MachineV1;
}

export type ApplicationArtifactFileURLV1 = Record<string, unknown>;
