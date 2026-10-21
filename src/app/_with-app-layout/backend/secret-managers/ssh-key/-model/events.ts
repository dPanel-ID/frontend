import { registerEvents } from '@/shared/libs/events';
import type { Rescope } from '@/shared/libs/events/models/registerEvents';

import type { FilterRules } from '../-rules';
import type {
  SshKeyCopyPublicKeyPayload,
  SshKeyDeletePayload,
  SshKeyDetailsPayload,
  SshKeyMigrateOwnershipPayload,
} from '../-rules/usecase-types';

type EventsRegistry = Rescope<
  '@ssh-keys',
  {
    'add-new'?: undefined;
    'filters/view-mode--change': FilterRules.ViewMode;
    'filters/search--input': FilterRules.SearchQuery;
    'filters/pagination--set': number;
    'data--refresh': null;
    'ssh-key--delete': SshKeyDeletePayload;
    'ssh-key--copy-public-key': SshKeyCopyPublicKeyPayload;
    'open--details': SshKeyDetailsPayload;
    'open--migrate-ownership': SshKeyMigrateOwnershipPayload;
  }
>;

export const [useEmit, useSubscribe] = registerEvents<EventsRegistry>();
