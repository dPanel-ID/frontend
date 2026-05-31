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
}
