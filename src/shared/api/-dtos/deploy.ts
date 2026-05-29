import type {
  ArtifactV1,
  ExecutionErrorDetailV1,
  MachineV1,
  ServiceOriginDetailV1,
} from '.';

export interface DeployV1 {
  id?: number;
  machine_id?: number;
  application_id?: number;
  application_phase?: string;
  installer_status?: string;
  is_primary?: boolean;
  bootstrap?: boolean;
  no_deploy?: boolean;
  error?: string;
  error_detail?: ExecutionErrorDetailV1 | null;
  user_id?: number;
  artifact_id?: number;
  artifact?: ArtifactV1;
  created_at?: string;
  updated_at?: string;
  machine?: MachineV1;
  service?: Partial<ServiceOriginDetailV1>;
}
