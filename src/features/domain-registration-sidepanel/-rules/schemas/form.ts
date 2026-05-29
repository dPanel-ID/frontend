import z from 'zod';

import { SchemaDomainParts } from '@/entities/domain/rules/schema';

const provider = z.enum([
  SchemaDomainParts.ProviderIdent.cloudflare,
  SchemaDomainParts.ProviderIdent.digitalOcean,
]);

export const schemaRegistrationForm = z.object({
  domain: z.string().min(1),
  description: z.string().optional(),
  provider,
  apiToken: z.string().min(1),
});
