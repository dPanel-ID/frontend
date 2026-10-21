import { z } from 'zod';

export const schemaSearchQuery = z.string().optional();
export type SearchQuery = z.output<typeof schemaSearchQuery>;

export const schemaCurrentPage = z.int().min(1).catch(1);
export type CurrentPage = z.output<typeof schemaCurrentPage>;

/** Same view modes as the servers list, so the control means the same thing. */
export const schemaViewMode = z.enum(['auto', 'list', 'grid', 'table']);
export type ViewMode = z.output<typeof schemaViewMode>;
