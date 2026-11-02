import {
  FolderOpenIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  PuzzleIcon,
  ScrollTextIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export const SERVER_DETAIL_TABS = [
  'overview',
  'modules',
  'services',
  'users',
  'network',
  'files',
  'logs',
  'settings',
] as const;

export type ServerDetailTab = (typeof SERVER_DETAIL_TABS)[number];

/** Views inside the Network tab; `view` is ignored on the other tabs. */
export const SERVER_NETWORK_VIEWS = [
  'ports',
  'interfaces',
  'firewall',
] as const;

export type ServerNetworkView = (typeof SERVER_NETWORK_VIEWS)[number];

export const schemaServerDetailSearch = z.object({
  tab: z.enum(SERVER_DETAIL_TABS).catch('overview').default('overview'),
  // Optional so links that only name a tab stay valid; an unknown value falls
  // back to the ports view instead of failing the route.
  view: z.enum(SERVER_NETWORK_VIEWS).optional().catch(undefined),
});

export type ServerDetailSearch = z.infer<typeof schemaServerDetailSearch>;

/** Tab order, icon and i18n key under `page.serverDetail.tabs`. */
export const SERVER_DETAIL_TAB_ITEMS: ReadonlyArray<{
  id: ServerDetailTab;
  icon: LucideIcon;
}> = [
  { id: 'overview', icon: LayoutDashboardIcon },
  { id: 'modules', icon: PuzzleIcon },
  { id: 'services', icon: SlidersHorizontalIcon },
  { id: 'users', icon: UsersIcon },
  { id: 'network', icon: NetworkIcon },
  { id: 'files', icon: FolderOpenIcon },
  { id: 'logs', icon: ScrollTextIcon },
  { id: 'settings', icon: SettingsIcon },
];
