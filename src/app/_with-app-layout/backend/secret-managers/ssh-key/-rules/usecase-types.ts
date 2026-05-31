export interface SshKeyDeletePayload {
  id: number | string;
  name: string;
}

export interface SshKeyDetailsPayload {
  sshKeyId: number | string;
  sshKeyName: string;
}
