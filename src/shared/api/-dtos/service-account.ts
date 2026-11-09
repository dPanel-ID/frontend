import { z } from 'zod';

/**
 * Service accounts (`/v1/service-accounts`). A token's secret appears only in
 * the response that creates it; lists carry a four-character hint.
 */

export const schemaServiceAccountTokenV1 = z.object({
  id: z.string(),
  name: z.string().optional(),
  hint: z.string().optional(),
  expires_at: z.string().nullish(),
  last_used_at: z.string().nullish(),
  revoked_at: z.string().nullish(),
  created_at: z.string().optional(),
});

export type ServiceAccountTokenV1 = z.infer<typeof schemaServiceAccountTokenV1>;

export const schemaServiceAccountV1 = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  owner_kind: z.string().optional(),
  role: z.string().optional(),
  username: z.string().optional(),
  created_at: z.string().optional(),
  tokens: z.array(schemaServiceAccountTokenV1).nullish(),
});

export type ServiceAccountV1 = z.infer<typeof schemaServiceAccountV1>;

export interface ServiceAccountListV1 {
  service_accounts?: ServiceAccountV1[] | null;
}

export interface ServiceAccountCreatedV1 {
  account: ServiceAccountV1;
  token: string;
}

export interface ServiceAccountTokenCreatedV1 {
  token_info: ServiceAccountTokenV1;
  token: string;
}
