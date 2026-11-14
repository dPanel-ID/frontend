import { createAdapter } from '@/entities/shared/lib/createAdapter';
import {
  resolveOwnershipOwner,
  resolveOwnershipPerson,
} from '@/entities/shared/lib/resolveOwnershipOwner';
import { resolveOwnershipTeamId } from '@/entities/shared/lib/resolveOwnershipTeamId';

import type { DTOs } from '@/shared/api';

import { schemaDnsRecordPage, schemaDomainCard } from '../rules/schema';
import type { DnsRecordPage, DomainCard } from '../rules/schema';

import { ctorDnsRecord, ctorProvider } from './ctors';

export const toDomainCard = createAdapter<DTOs.DomainV1, DomainCard>((raw) => {
  return schemaDomainCard.parse({
    id: String(raw.id),
    ownership: {
      owner: resolveOwnershipOwner(raw),
      ...resolveOwnershipPerson(raw),
      team: raw.organization?.name,
      teamId: resolveOwnershipTeamId(raw),
    },
    timestamp: {
      created: raw.created_at,
      updated: raw.updated_at,
    },
    domain: raw.domain,
    description: raw.name,
    provider: ctorProvider(raw),
  });
});

export const toDnsRecordPage = createAdapter<
  DTOs.DomainRecordListResponseV1,
  DnsRecordPage
>((raw) => {
  return schemaDnsRecordPage.parse({
    // Older API builds send `null` rather than `[]` when nothing matches.
    records: ((raw.result as DTOs.DomainRecordItemV1[] | null) ?? []).map(
      ctorDnsRecord,
    ),
    page: raw.result_info.page,
    totalPage: raw.result_info.total_pages,
    total: raw.result_info.total_count,
  });
});
