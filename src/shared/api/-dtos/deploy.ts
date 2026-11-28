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
  /** Who started the deployment, as a public profile (never email). */
  user?: {
    id?: number | string;
    username?: string;
    fullname?: string;
    avatar_url?: string;
  };
  artifact_id?: number;
  artifact?: ArtifactV1;
  created_at?: string;
  updated_at?: string;
  machine?: MachineV1;
  service?: Partial<ServiceOriginDetailV1>;
}

/** One release folder of an application on one server. */
export interface DeployReleaseV1 {
  /** <UTC yyyymmddHHMMSS>-<short commit>, or 00000000000000-in-place. */
  name: string;
  created_at?: string | null;
  commit?: string | null;
  current?: boolean;
  previous?: boolean;
}

/** GET /v1/deploy/{id}/releases: the release folders on that server. */
export interface DeployReleasesV1 {
  strategy?: 'in_place' | 'releases' | '' | null;
  keep_releases?: number | null;
  current?: string | null;
  previous?: string | null;
  /** Newest first. */
  releases?: DeployReleaseV1[] | null;
  /** When the server last reported them; null before the first report. */
  reported_at?: string | null;
  rollback_available?: boolean;
  /** A deploy or rollback is in progress on that server. */
  running?: boolean;
}

/** POST /v1/deploy/{id}/rollback. */
export interface DeployRollbackV1 {
  execution_id?: string;
  /** Empty when the server picks the previous release. */
  release?: string;
}
