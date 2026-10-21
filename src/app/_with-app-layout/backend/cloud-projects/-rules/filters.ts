import { z } from 'zod';

export const schemaSearchQuery = z.string().optional();
export type SearchQuery = z.output<typeof schemaSearchQuery>;

export const schemaCurrentPage = z.int().min(1).catch(1);
export type CurrentPage = z.output<typeof schemaCurrentPage>;

/** Same view modes as the servers list, so the control means the same thing. */
export const schemaViewMode = z.enum(['auto', 'list', 'grid', 'table']);
export type ViewMode = z.output<typeof schemaViewMode>;

/**
 * States the list can be narrowed to, empty meaning every state. These are
 * the values the backend accepts for its `installer_status` filter; the
 * terminal ones are not offered because a removed account is not listed.
 */
export const schemaStatus = z.enum(['', 'ready', 'progress', 'failed']);
export type Status = z.output<typeof schemaStatus>;
