import type { DTOs } from '@/shared/api';

import type { DnsRecord, ProviderDetails } from '../rules/schema/parts';
import { ProviderIdent, isProviderIdent } from '../rules/schema/parts';

export function ctorProvider({ provider }: DTOs.DomainV1) {
  if (isProviderIdent(provider) && provider !== ProviderIdent.unknown) {
    return provider;
  }

  return ProviderIdent.unknown;
}

export function ctorProviderDetails(raw: DTOs.DomainV1): ProviderDetails {
  const ident = ctorProvider(raw);

  if (ident === ProviderIdent.unknown) {
    return {
      ident,
      rawParams: '{}',
    };
  }

  return {
    ident,
    params: {},
  };
}

export function ctorDnsRecord(
  raw: DTOs.DomainRecordItemV1,
): Partial<DnsRecord> {
  return {
    id: raw.id,
    type: raw.type,
    content: raw.content,
    name: raw.name,
    ttl: raw.ttl,
    comment: raw.comment,
  };
}
