import type { ReactNode } from 'react';

import type { ServerCard } from '@/entities/server/rules/schema';

import type { ServerHandlers } from '../useServerHandlers';

export interface ServerCardProps {
  server: ServerCard;
  /**
   * What the card can do with the server. Without handlers the card is
   * read-only: no actions, and nothing navigates (the administrator's list
   * shows servers of workspaces the viewer is not in).
   */
  handlers?: ServerHandlers;
  applicationCount?: number;
  /** Load balancers on the server, when the caller already knows; the card
   * reads it from the selected workspace otherwise. */
  loadBalancerCount?: number;
  /** Shown beside the status, such as the workspace on the admin list. */
  badge?: ReactNode;
}
