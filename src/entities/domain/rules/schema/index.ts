import { z } from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

import { dnsRecord, domain, provider } from './parts';

export * as SchemaDomainParts from './parts';

export type DomainEssentials = z.output<typeof schemaDomainEssentials>;
export const schemaDomainEssentials = z.object({
  id: SchemaCommon.unitId,
  ownership: SchemaCommon.ownership,
  timestamp: SchemaCommon.timestamp,
  domain,
  description: z.string().optional(),
});

export type DomainCard = z.output<typeof schemaDomainCard>;
export const schemaDomainCard = z.intersection(
  schemaDomainEssentials,
  z.object({
    provider,
  }),
);

/** One page of a domain's DNS records, as the record list returns it. */
export type DnsRecordPage = z.output<typeof schemaDnsRecordPage>;
export const schemaDnsRecordPage = z.object({
  records: z.array(dnsRecord),
  page: z.number(),
  totalPage: z.number(),
  /** Records across every page that match the search, if any. */
  total: z.number(),
});
