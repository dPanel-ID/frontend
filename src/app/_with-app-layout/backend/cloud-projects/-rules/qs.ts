import { z } from 'zod';

import { FilterRules } from '.';

export const schemaQueryString = z.object({
  q: FilterRules.schemaSearchQuery,
  page: FilterRules.schemaCurrentPage,
  status: z
    .preprocess((val) => val ?? '', FilterRules.schemaStatus.catch(''))
    .optional(),
  viewMode: z
    .preprocess(
      (val) => val ?? 'auto',
      FilterRules.schemaViewMode.default('auto'),
    )
    .optional(),
});

export type QueryString = z.output<typeof schemaQueryString>;

export const keysOfQueryString = schemaQueryString.keyof().options;
