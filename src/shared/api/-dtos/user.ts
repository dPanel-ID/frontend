export interface User {
  id: number | string;
  fullname: string;
  username: string;
  email: string;
  password?: string;
  register_from_user_id?: string;
  register_from?: string;
  avatar_url?: string;
  actived_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPublicV1 {
  id: string;
  fullname?: string;
  username?: string;
  avatar_url?: string;
  actived_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPublicContactV1 extends UserPublicV1 {
  /** Set for a service account, so people can tell it apart. */
  is_service_account?: boolean;
  email?: string;
  register_from?: string;
  register_from_user_id?: string;
}

export interface ProviderData {
  provider?: string;
  subject?: string;
  nickname?: string;
  /** Whether the account is linked. The tokens themselves stay on the server. */
  connected?: boolean;
  expires_at?: string;
  groups?: string[];
  permissions?: string[];
  roles?: string[];
}

export type Github = ProviderData;
