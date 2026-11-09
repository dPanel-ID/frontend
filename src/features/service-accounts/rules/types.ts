import { z } from 'zod';

export interface ServiceAccountsPanelProps {
  /** A team's group ID, or "personal" for the caller's own accounts. */
  workspaceId: string;
}

export const EXPIRY_DAYS = ['30', '90', '365', '0'] as const;
export const DEFAULT_EXPIRY_DAYS = '90';

export const WORKSPACE_ROLES = [
  'developer',
  'devops',
  'viewer',
  'admin',
] as const;
export const DEFAULT_WORKSPACE_ROLE = 'developer';

export const schemaAccountForm = z.object({
  name: z.string().trim().min(2).max(64),
  description: z.string().trim().max(255),
});

export const schemaTokenForm = z.object({
  name: z.string().trim().min(1).max(64),
});

export type TokenStatus = 'active' | 'expired' | 'revoked';

export interface TokenRow {
  id: string;
  name: string;
  hint: string;
  status: TokenStatus;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface AccountRow {
  id: string;
  name: string;
  description?: string;
  role?: string;
  username?: string;
  createdAt?: string;
  tokens: TokenRow[];
}
