export interface SshKeyV1 {
  id?: number;
  type?: string;
  name?: string;
  user_id?: number;
  organization_id?: string;
  key_prefix?: string;
  owner_provider?: string;
  owner_subject?: string;
  workspace_id?: string;
  workspace_type?: string;
  token_version?: string;
  data?: SshKeyDataV1;
  error?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id?: number;
    fullname?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
  };
  organization?: {
    id?: string;
    name?: string;
  };
}

export interface SshKeyDataV1 {
  /** Only ever present in the response that created the key. */
  private?: string;
  public?: string;
  /** RSA size in bits, as a string. Absent for Ed25519, which has no size. */
  length?: string;
  /** "ed25519" or "rsa". Derived from the public key for older records. */
  algorithm?: string;
  /** "SHA256:..." identifier of the public key. */
  fingerprint?: string;
  /** Label on the public key, normally the owner's email. */
  comment?: string;
}

/** One choice offered by GET /v1/secret/ssh-key/algorithms. */
export interface SshKeyAlgorithmV1 {
  name: string;
  label: string;
  description?: string;
  recommended?: boolean;
  key_sizes?: number[];
  default_size?: number;
}

export interface SshKeyAlgorithmsV1 {
  algorithms: SshKeyAlgorithmV1[];
  default: string;
}
