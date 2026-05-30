import * as tldts from 'tldts';
import { z } from 'zod';

import { SchemaCommon } from '@/entities/shared/rules/schema';

export const ProviderIdent = {
  cloudflare: 'CloudFlare',
  digitalOcean: 'DigitalOcean',
  goDaddy: 'GoDaddy',
  netlify: 'Netlify',
  namecheap: 'Namecheap',
  vultr: 'Vultr',
  linode: 'Linode',
  hetzner: 'Hetzner',
  unknown: 'unknown',
} as const;

export const ProviderValues = [
  ProviderIdent.cloudflare,
  ProviderIdent.digitalOcean,
  ProviderIdent.goDaddy,
  ProviderIdent.netlify,
  ProviderIdent.namecheap,
  ProviderIdent.vultr,
  ProviderIdent.linode,
  ProviderIdent.hetzner,
  ProviderIdent.unknown,
] as const;

export const domain = z.string().transform((val, ctx) => {
  const {
    publicSuffix: tld,
    domainWithoutSuffix: l1,
    subdomain,
    hostname,
  } = tldts.parse(val);

  if (!hostname) {
    ctx.addIssue({
      code: 'custom',
      message: 'formErrors.parseDomain.invalidTld',
    });
    return z.NEVER;
  }

  if (!tld) {
    ctx.addIssue({
      code: 'custom',
      message: 'formErrors.parseDomain.invalidTld',
    });
    return z.NEVER;
  }

  if (!l1) {
    ctx.addIssue({
      code: 'custom',
      message: 'formErrors.parseDomain.invalidDomain',
    });
    return z.NEVER;
  }

  return {
    hostname,
    tld,
    l1,
    subdomain,
  };
});

export type Provider = z.output<typeof provider>;
export const provider = z.enum(ProviderValues);

export function isProviderIdent(value?: string | null): value is Provider {
  return ProviderValues.includes(value as Provider);
}

export type ProviderDetails = z.output<typeof providerDetails>;
const knownProviderDetails = <T extends Provider>(ident: T) =>
  z.object({
    ident: z.literal(ident),
    params: z.record(z.string(), z.string()).optional(),
  });

export const providerDetails = z.discriminatedUnion('ident', [
  knownProviderDetails(ProviderIdent.cloudflare),
  knownProviderDetails(ProviderIdent.digitalOcean),
  knownProviderDetails(ProviderIdent.goDaddy),
  knownProviderDetails(ProviderIdent.netlify),
  knownProviderDetails(ProviderIdent.namecheap),
  knownProviderDetails(ProviderIdent.vultr),
  knownProviderDetails(ProviderIdent.linode),
  knownProviderDetails(ProviderIdent.hetzner),
  z.object({
    ident: z.literal(ProviderIdent.unknown),
    rawParams: z.string().optional(),
  }),
]);

export const dnsRecordBase = z.object({
  id: SchemaCommon.unitId,
  name: z.string(),
  content: z.string(),
  ttl: z.number(),
  comment: z.string().optional(),
});

export type DnsRecord = z.output<typeof dnsRecord>;
export const dnsRecord = z.intersection(
  dnsRecordBase,
  z.object({
    type: z.string(),
  }),
);
