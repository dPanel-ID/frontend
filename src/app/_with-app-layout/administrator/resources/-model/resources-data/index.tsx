import { useEffect, useState } from 'react';

import { ApiAdmin } from '@/shared/api';
import type { AdminResourceType } from '@/shared/api/admin.resource.find';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { RESOURCES_PAGE_SIZE } from '../../-lib/resource-types';

/** How long typing pauses before the search reaches the API. */
const SEARCH_DEBOUNCE_MS = 300;

export const [AdminResourcesDataModelProvider, useAdminResourcesDataModel] =
  buildSelector('AdminResourcesDataModel')(() => {
    const [type, setType] = useState<AdminResourceType>('servers');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setSearch(searchInput.trim());
        setPage(1);
      }, SEARCH_DEBOUNCE_MS);
      return () => window.clearTimeout(timer);
    }, [searchInput]);

    const [response, refresh] = ApiAdmin.Resource.Find.useGet({
      type,
      search,
      page,
      limit: RESOURCES_PAGE_SIZE,
    });

    const resources = useAdapter(response, (raw) => {
      const total = raw.total ?? 0;
      return {
        /** The type these rows are, so a tab never shows another tab's rows. */
        type: raw.type,
        items: raw.items ?? [],
        counts: raw.counts ?? {},
        total,
        totalPage: Math.max(1, Math.ceil(total / RESOURCES_PAGE_SIZE)),
      };
    });

    return {
      type,
      searchInput,
      search,
      page,
      resources,
      refresh,
      changeType: (next: AdminResourceType) => {
        setType(next);
        setPage(1);
      },
      changeSearch: setSearchInput,
      changePage: setPage,
    };
  });
