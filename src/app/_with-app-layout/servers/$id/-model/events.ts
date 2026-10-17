import { registerEvents } from '@/shared/libs/events';
import type { Rescope } from '@/shared/libs/events/models/registerEvents';

import type { FavoriteNavigationPayload } from '../-rules/usecase-types';

type EventsRegistry = {
  'server-detail-refresh': null;
  'server-stats-refresh': null;
  'server-services-refresh': null;
  'server-modules-refresh': null;
  /** Lifecycle actions on the server shown; payloads come from the detail model. */
  'server-edit': null;
  'server-reinstall': null;
  'server-delete': null;
  'server-migrate-ownership': null;
  'server-status-info': null;
  'favorite-navigation': FavoriteNavigationPayload;
};

export const [useEmit, useSubscribe] =
  registerEvents<Rescope<'@servers::detail', EventsRegistry>>();
