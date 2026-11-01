import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { iife } from '@/shared/libs/browser/fn';
import buildSelector from '@/shared/libs/react-factories/buildSelector';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { FilterRules } from '../../-rules';
import type { QueryString } from '../../-rules/qs';
import { useSubscribe } from '../events';

export const [FilterModelProvider, useFilterModel] = buildSelector(
  'FilterModel',
)(() => {
  const navigate = useNavigate({
    from: '/backend/secret-managers/ssh-key',
  });

  const qs = useSearch({
    from: '/_with-app-layout/backend/secret-managers/ssh-key/',
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

  useSubscribe('@ssh-keys/filters/search--input', (input) => {
    updateQs('q', input || undefined);
  });

  useSubscribe('@ssh-keys/filters/view-mode--change', (newViewMode) => {
    updateQs('viewMode', newViewMode !== 'table' ? newViewMode : undefined);
  });

  useSubscribe('@ssh-keys/filters/pagination--set', (newPage) => {
    updateQs('page', newPage < 2 ? 1 : newPage);
  });

  const mappedFilters = useMemo(() => {
    const searchQuery: FilterRules.SearchQuery = qs.q;
    const currentPage: FilterRules.CurrentPage = qs.page;
    const viewMode: FilterRules.ViewMode =
      qs.viewMode != null ? qs.viewMode : 'table';

    const derivedViewMode = iife((): Exclude<FilterRules.ViewMode, 'auto'> => {
      if (viewMode !== 'auto') return viewMode;
      return 'table';
    });

    return {
      searchQuery,
      currentPage,
      viewMode,
      derivedViewMode,
    };
  }, [qs]);

  return mappedFilters;
});
