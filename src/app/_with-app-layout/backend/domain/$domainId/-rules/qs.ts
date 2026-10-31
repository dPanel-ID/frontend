import { z } from 'zod';

/**
 * The record search lives in the URL, so a filtered list can be bookmarked,
 * shared and reloaded. Values the API would refuse are dropped rather than
 * failing the page.
 */
export const schemaDomainDetailQuery = z.object({
  search: z.string().trim().min(1).max(253).optional().catch(undefined),
  type: z
    .string()
    .regex(/^[A-Za-z]{1,10}$/)
    .transform((value) => value.toUpperCase())
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type DomainDetailQuery = z.output<typeof schemaDomainDetailQuery>;
