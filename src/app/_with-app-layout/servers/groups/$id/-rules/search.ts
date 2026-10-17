import { z } from 'zod';

export const GROUP_DETAIL_TABS = ['members', 'operations'] as const;

export type GroupDetailTab = (typeof GROUP_DETAIL_TABS)[number];

export const schemaGroupDetailSearch = z.object({
  tab: z.enum(GROUP_DETAIL_TABS).catch('members').default('members'),
  operationId: z.string().optional(),
});
