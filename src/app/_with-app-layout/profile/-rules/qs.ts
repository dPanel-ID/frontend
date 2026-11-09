import { z } from 'zod';

export const PROFILE_TABS = ['profile', 'workers', 'service-accounts'] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number];

export const schemaQueryString = z.object({
  tab: z.enum(PROFILE_TABS).optional().catch(undefined),
});
