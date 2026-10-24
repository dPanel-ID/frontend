import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { iife } from '@/shared/libs/browser/fn';
import buildSelector from '@/shared/libs/react-factories/buildSelector';
import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { FilterRules } from '../-rules';
import type { QueryString } from '../-rules/qs';

import { useSubscribe } from './events';

export const [FilterModelProvider, useFilterModel] = buildSelector(
  'FilterModel',
)(() => {
  const isDesktop = useBreakpoint('lg');

  const navigate = useNavigate({
    from: '/backend/load-balancers',
  });

  const qs = useSearch({
    from: '/_with-app-layout/backend/load-balancers/',
  });

  const updateQs = useHandler(
    <K extends keyof QueryString>(key: K, value: QueryString[K]) => {
      navigate({
        search: (prev) => ({
          ...prev,
          [key]: value,
        }),
        replace: true,
      });
    },
  );

  useSubscribe('@load-balancers/filters/search--input', (input) => {
    updateQs('q', input || undefined);
  });

  useSubscribe('@load-balancers/filters/view-mode--change', (newViewMode) => {
    updateQs('viewMode', newViewMode !== 'auto' ? newViewMode : undefined);
  });

  useSubscribe('@load-balancers/filters/pagination--set', (newPage) => {
    updateQs('page', newPage < 2 ? 1 : newPage);
  });

  useSubscribe('@load-balancers/filters/status--change', (newStatus) => {
    updateQs('status', newStatus || undefined);
  });

  const mappedFilters = useMemo(() => {
    const searchQuery: FilterRules.SearchQuery = qs.q;
    const currentPage: FilterRules.CurrentPage = qs.page;
    const status: FilterRules.Status = qs.status ?? '';
    const viewMode: FilterRules.ViewMode =
      qs.viewMode != null ? qs.viewMode : 'auto';

    // The same four modes as every other list. This module used to map
    // `list` onto the table and resolve `auto` to it as well, leaving it
    // without the full-width row view the rest of the product has.
    const derivedViewMode = iife((): 'list' | 'grid' | 'table' => {
      if (viewMode === 'list') return 'list';
      if (viewMode === 'grid') return 'grid';
      if (viewMode === 'table') return 'table';

      return isDesktop ? 'list' : 'grid';
    });

    return {
      searchQuery,
      currentPage,
      status,
      viewMode,
      derivedViewMode,
    };
  }, [qs, isDesktop]);

  return mappedFilters;
});
