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
    // An application row is inherently tabular, so this module offers grid
    // and table only. `list` stays readable so older bookmarked URLs keep
    // working, and resolves to the dense table.
    viewMode: (value) => {
      switch (value) {
        case 'grid':
          return 'grid' as const;

        case 'table':
        case 'list':
          return 'table' as const;

        default:
          return 'auto' as const;
      }
    },
  },
);
