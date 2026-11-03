import { registerEvents } from '@/shared/libs/events';
import type { Rescope } from '@/shared/libs/events/models/registerEvents';

import type { AdminTaskActionPayload } from '../-rules/usecase-types';

type EventsRegistry = Rescope<
  '@admin-tasks',
  {
    'data--refresh': null;
    'task--reclaim': AdminTaskActionPayload;
    'task--delete': AdminTaskActionPayload;
  }
>;

export const [useEmit, useSubscribe] = registerEvents<EventsRegistry>();
