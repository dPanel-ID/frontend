import type { ServerCard } from '@/entities/server/rules/schema';

import type { ServerHandlers } from '../useServerHandlers';

export interface ServerCardProps {
  server: ServerCard;
  handlers: ServerHandlers;
  applicationCount?: number;
}
