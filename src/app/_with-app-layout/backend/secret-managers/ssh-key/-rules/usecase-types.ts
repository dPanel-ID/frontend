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

export interface SshKeyCopyPublicKeyPayload {
  /** The public half only; the private half never reaches the browser. */
  publicKey?: string | null;
}
