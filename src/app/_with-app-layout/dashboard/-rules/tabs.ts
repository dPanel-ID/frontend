import {
  ActivityIcon,
  LayoutDashboardIcon,
  ServerIcon,
  UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export const DASHBOARD_TABS = [
  'overview',
  'activity',
  'resources',
  'workspace',
] as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export const schemaDashboardSearch = z.object({
  tab: z.enum(DASHBOARD_TABS).catch('overview').default('overview'),
});

export type DashboardSearch = z.infer<typeof schemaDashboardSearch>;

/** Tab order, icon and i18n key under `page.dashboard.tabs`. */
export const DASHBOARD_TAB_ITEMS: ReadonlyArray<{
  id: DashboardTab;
  icon: LucideIcon;
  /**
   * Team-only tabs are not rendered in a personal workspace. A personal
   * workspace has no members and no shared configuration, so the tab would
   * exist only to explain why it is empty.
   */
  teamOnly?: boolean;
}> = [
  { id: 'overview', icon: LayoutDashboardIcon },
  { id: 'activity', icon: ActivityIcon },
  { id: 'resources', icon: ServerIcon },
  { id: 'workspace', icon: UsersIcon, teamOnly: true },
];

/** The tabs a workspace of this kind actually has. */
export function dashboardTabsFor(isTeamWorkspace: boolean) {
  return DASHBOARD_TAB_ITEMS.filter(
    (item) => isTeamWorkspace || !item.teamOnly,
  );
}

/**
 * The tab to render. A personal workspace that lands on a team-only tab —
 * from a bookmark, a shared link, or switching workspace while the tab was
 * open — falls back to the overview rather than showing an empty or
 * nonsensical panel.
 */
export function resolveDashboardTab(
  tab: DashboardTab,
  isTeamWorkspace: boolean,
): DashboardTab {
  const available = dashboardTabsFor(isTeamWorkspace);
  return available.some((item) => item.id === tab) ? tab : 'overview';
}
