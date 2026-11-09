import { z } from 'zod';

import { FilterRules } from '.';

export const TEAM_TABS = ['members', 'workers', 'service-accounts'] as const;

export type TeamTab = (typeof TEAM_TABS)[number];

export const schemaQueryString = z.object({
  tab: z.enum(TEAM_TABS).optional().catch(undefined),
  page: FilterRules.schemaCurrentPage,
  viewMode: z
    .preprocess(
      (val) => val ?? 'auto',
      FilterRules.schemaViewMode.default('table'),
    )
    .optional(),
});

export type QueryString = z.output<typeof schemaQueryString>;

export const keysOfQueryString = schemaQueryString.keyof().options;
