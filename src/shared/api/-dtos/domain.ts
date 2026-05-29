import type { OrganizationV1 } from './organization';
import type { User } from './user';

export interface DomainV1 {
  id?: number;
  provider?: string;
  name?: string;
  domain?: string;
  is_public?: boolean;
  origin_dns_id?: string;
  credential?: Record<string, unknown>;
  key_prefix?: string;
  owner?: number;
  owner_provider?: string;
  owner_subject?: string;
  organization_id?: string;
  user_id?: number;
  workspace_id?: string;
  workspace_type?: string;
  created_at?: string;
  updated_at?: string;
  installer_status?: string;
  error?: string;
  organization?: OrganizationV1;
  user?: User;
}

export interface DomainPayloadV1 {
  credential?: Record<string, unknown>;
  domain?: string;
  error?: string;
  id?: number;
  installer_status?: string;
  is_public?: boolean;
  key_prefix?: string;
  name?: string;
  origin_dns_id?: string;
  owner_provider?: string;
  owner_subject?: string;
  provider?: string;
  workspace_id?: string;
  workspace_type?: string;
}

export interface DomainContractPayloadV1 {
  credential?: Record<string, string>;
  domain?: string;
  is_public?: boolean;
  name?: string;
  provider?: string;
}

export interface CloudFlarePagination {
  page: number;
  per_page: number;
  count: number;
  total_count: number;
  total_pages: number;
}

export interface CloudFlareMetaItem {
  auto_added: boolean;
  managed_by_apps: boolean;
  managed_by_argo_tunnel: boolean;
}

export interface CloudFlareItem {
  comment?: string;
  name?: string;
  proxied?: boolean;
  settings?: {};
  tags?: any[];
  ttl?: number;
  content?: string;
  type?: string;
  comment_modified_on?: string;
  created_on?: string;
  id?: string;
  meta?: CloudFlareMetaItem;
  modified_on?: string;
  proxiable?: boolean;
  tags_modified_on?: string;
}

export interface CloudFlarePayload {
  comment?: string;
  content?: string;
  name?: string;
  proxied?: boolean;
  tags?: unknown[];
  ttl?: number;
  type?: string;
}

export interface CloudFlareListResponse {
  result: CloudFlareItem[];
  success: boolean;
  errors: unknown[];
  messages: unknown[];
  result_info: CloudFlarePagination;
}

export interface CloudFlareDetailResponse {
  result: CloudFlareItem;
  success: boolean;
  errors: CloudFlareErrorResponse[];
  messages: unknown[];
}

export interface CloudFlareErrorResponse {
  code: number;
  message: string;
}
