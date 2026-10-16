export interface CloudProjectDeletePayload {
  id: string;
  name: string;
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
