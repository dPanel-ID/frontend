export interface SshKeyDeletePayload {
  id: number | string;
  name: string;
}

export interface SshKeyMigrateOwnershipPayload {
  id: number | string;
  name: string;
  teamName?: string | null;
  /** Casdoor workspace group ID; absent for personal keys. */
  teamId?: string | null;
}

export interface SshKeyDetailsPayload {
  sshKeyId: number | string;
  sshKeyName: string;
}
