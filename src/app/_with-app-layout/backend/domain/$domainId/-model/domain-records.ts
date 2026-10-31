import { useEffect, useState } from 'react';

import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

import { AdapterDomainFromDto } from '@/entities/domain/adapter';

import { ApiDomain } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { RECORDS_PAGE_SIZE, RECORDS_SEARCH_DEBOUNCE_MS } from '../-lib/records';
import type { DomainDetailQuery } from '../-rules/qs';

const ROUTE_ID = '/_with-app-layout/backend/domain/$domainId/';

/**
 * A domain and one page of its DNS records.
 *
 * The search and type filter run on the API, before paging, so a page and
 * its totals only ever count matching records. The search box updates the
 * URL after a short pause in typing, not on every key.
 */
export const [DomainRecordsModelProvider, useDomainRecordsModel] =
  buildSelector('DomainRecordsModel')(() => {
    const { domainId } = useParams({ from: ROUTE_ID });
    const query = useSearch({ from: ROUTE_ID });
    const navigate = useNavigate({ from: '/backend/domain/$domainId' });

    const search = query.search ?? '';
    const type = query.type;
    const page = query.page ?? 1;

    const updateQuery = useHandler((next: Partial<DomainDetailQuery>) => {
      navigate({
        search: (prev) => ({ ...prev, ...next }),
        replace: true,
      });
    });

    // What is in the box, ahead of the URL while the reader is typing.
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
      setSearchInput(search);
    }, [search]);

    useEffect(() => {
      const next = searchInput.trim();
      if (next === search) return;

      const timer = window.setTimeout(() => {
        updateQuery({ search: next || undefined, page: undefined });
      }, RECORDS_SEARCH_DEBOUNCE_MS);

      return () => window.clearTimeout(timer);
    }, [search, searchInput, updateQuery]);

    const [responseDomain, refreshDomain] = ApiDomain.Detail.$Id.useGet({
      domainId,
    });
    const [responseRecords, refreshRecords] = ApiDomain.Origin.$Id.useGet({
      domainId,
      page,
      limit: RECORDS_PAGE_SIZE,
      search: search || undefined,
      type,
    });

    const domain = useAdapter(responseDomain, (raw) =>
      AdapterDomainFromDto.toDomainCard(raw).unwrap(),
    );
    const records = useAdapter(responseRecords, (raw) =>
      AdapterDomainFromDto.toDnsRecordPage(raw).unwrap(),
    );

    // Keep the last page on screen while the next one loads, so typing a
    // search does not flash the table empty between keys.
    const shownRecords =
      records.$status === 'loading' && records.prevData
        ? { ...records.prevData, $status: 'success' as const }
        : records;

    const refresh = useHandler(() => {
      refreshDomain();
      refreshRecords();
    });

    return {
      domainId,
      domain,
      records: shownRecords,
      isFetchingRecords: records.$status === 'loading',
      refresh,
      refreshRecords,
      search,
      searchInput,
      setSearchInput,
      type,
      setType: (nextType?: string) =>
        updateQuery({ type: nextType, page: undefined }),
      page,
      setPage: (nextPage: number) =>
        updateQuery({ page: nextPage > 1 ? nextPage : undefined }),
      clearFilters: () => {
        setSearchInput('');
        updateQuery({ search: undefined, type: undefined, page: undefined });
      },
    };
  });
