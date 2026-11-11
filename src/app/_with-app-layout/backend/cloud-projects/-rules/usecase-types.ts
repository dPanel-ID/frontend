export interface CloudProjectDeletePayload {
  id: string;
  name: string;
}

export interface CloudProjectCredentialsPayload {
  id: string;
  name: string;
  /** Raw provider ID; picks the credential form. */
  provider: string;
}

export interface CloudProjectDetailsPayload {
  cloudProjectId: string;
  cloudProjectName: string;
}

export interface CloudProjectMigrateOwnershipPayload {
  id: string;
  name: string;
  teamName?: string | null;
  /** Casdoor workspace group ID; absent for personal projects. */
  teamId?: string | null;
}

export interface CloudProjectOrphansPayload {
  id: string;
  name: string;
  /** Raw provider ID; only supported providers open the scan. */
  provider: string;
}
