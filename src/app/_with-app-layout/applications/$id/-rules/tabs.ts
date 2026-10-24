import {
  LayoutDashboardIcon,
  RocketIcon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export const APPLICATION_DETAIL_TABS = [
  'overview',
  'deployments',
  'logs',
  'settings',
] as const;

export type ApplicationDetailTab = (typeof APPLICATION_DETAIL_TABS)[number];

export const schemaApplicationDetailSearch = z.object({
  tab: z.enum(APPLICATION_DETAIL_TABS).catch('overview').default('overview'),
});

export type ApplicationDetailSearch = z.infer<
  typeof schemaApplicationDetailSearch
>;

/** Tab order, icon and i18n key under `page.applicationDetail.tabs`. */
export const APPLICATION_DETAIL_TAB_ITEMS: ReadonlyArray<{
  id: ApplicationDetailTab;
  icon: LucideIcon;
}> = [
  { id: 'overview', icon: LayoutDashboardIcon },
  { id: 'deployments', icon: RocketIcon },
  { id: 'logs', icon: ScrollTextIcon },
  { id: 'settings', icon: SlidersHorizontalIcon },
];
