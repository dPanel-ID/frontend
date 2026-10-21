import { AdapterDomainFromDto } from '@/entities/domain/adapter';
import { SchemaDomainParts } from '@/entities/domain/rules/schema';

import { ApiDomain } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

/**
 * Domains read for the overview tiles. The total still comes from the API,
 * so only the provider and ownership splits are a sample.
 */
export const OVERVIEW_SAMPLE_SIZE = 100;

export interface DomainsOverview {
  total: number;
  /** Distinct DNS providers among the sampled domains, unknown excluded. */
  providers: number;
  team: number;
  personal: number;
  /** True when the workspace holds more domains than the sample covers. */
  sampled: boolean;
}

/**
 * Counts across the workspace, independent of search and page, so the tiles
 * above the list describe every domain rather than the current page.
 */
export const [DomainOverviewModelProvider, useDomainOverviewModel] =
  buildSelector('DomainOverviewModel')(() => {
    const [response, refresh] = ApiDomain.Find.useGet({
      page: 1,
      perPage: OVERVIEW_SAMPLE_SIZE,
    });

    useSubscribe('@domain-dns/data--refresh', () => {
      refresh();
    });

    return {
      overview: useAdapter(response, summarizeDomains),
    };
  });

export function summarizeDomains(raw: {
  domains?: DTOs.DomainV1[];
  pagination: DTOs.Pagination;
}): DomainsOverview {
  const providers = new Set<string>();
  const overview: DomainsOverview = {
    total: raw.pagination.total_item,
    providers: 0,
    team: 0,
    personal: 0,
    sampled: (raw.domains ?? []).length < raw.pagination.total_item,
  };

  for (const dto of raw.domains ?? []) {
    const parsed = AdapterDomainFromDto.toDomainCard(dto);
    if (!parsed.ok) continue;

    const domain = parsed.unwrap();

    if (domain.ownership.team) overview.team += 1;
    else overview.personal += 1;

    if (domain.provider !== SchemaDomainParts.ProviderIdent.unknown) {
      providers.add(domain.provider);
    }
  }

  overview.providers = providers.size;

  return overview;
}
