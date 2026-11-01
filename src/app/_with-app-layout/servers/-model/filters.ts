import { buildQsFilterContext } from '@/shared/libs/react-factories/buildQsFilterContext';

/** Server states the list can be narrowed to; empty means every state. */
export type ServerStatusFilter = '' | 'ready' | 'progress' | 'failed';

export type ServerViewMode = 'auto' | 'list' | 'grid' | 'table';

export const [FilterModelProvider, useFilterModel] = buildQsFilterContext(
  'Filter',
  {
    ownership: (value) => {
      switch (value) {
        case 'mine':
          return 'mine' as const;

        case 'public-resource':
          return 'public-resource' as const;

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
    status: {
      qs: 'status',
      init: (value): ServerStatusFilter => {
        if (value === 'ready' || value === 'progress' || value === 'failed') {
          return value;
        }
        return '';
      },
    },
    pagination: {
      qs: 'page',
      init: (value) => Number(value) || 1,
    },
    viewMode: {
      qs: 'viewMode',
      init: (value): ServerViewMode => {
        if (value === 'list' || value === 'grid' || value === 'table') {
          return value;
        }
        return 'table';
      },
    },
  },
);
