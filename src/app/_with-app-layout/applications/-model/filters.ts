import { buildQsFilterContext } from '@/shared/libs/react-factories/buildQsFilterContext';

export const [FilterModelProvider, useFilterModel] = buildQsFilterContext(
  'AppsFilter',
  {
    ownership: (value) => {
      switch (value) {
        case 'mine':
          return 'mine' as const;

        case 'team':
          return 'team' as const;

        default:
          return null;
      }
    },
    searchQuery: {
      qs: 'q',
      init: (value) => value || '',
    },
    pagination: {
      qs: 'page',
      init: (value) => Number(value) || 1,
    },
    // The same four modes as every other list. This module used to map
    // `list` onto the table and resolve `auto` to it as well, which left
    // it the only list in the product with no full-width row view.
    viewMode: (value): 'auto' | 'list' | 'grid' | 'table' => {
      switch (value) {
        case 'list':
          return 'list' as const;

        case 'grid':
          return 'grid' as const;

        case 'table':
          return 'table' as const;

        default:
          return 'table' as const;
      }
    },
  },
);
