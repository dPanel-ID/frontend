import { useState } from 'react';

import { moduleStatusPollMs } from '@/entities/server-modules/lib/status-polling';

import { ApiServer } from '@/shared/api';

/**
 * The modules installed on the application's server, read again every few
 * seconds while one of them is still installing.
 *
 * The database and Redis helpers use it, so a Redis picked in the wizard's
 * previous step is offered as soon as its install has finished. Polling
 * stops once every module has settled.
 */
export function useServerModules(serverId: string) {
  const [pollMs, setPollMs] = useState(0);
  const [inventory, refetch] = ApiServer.Modules.$Id.useGet({
    serverId,
    options: {
      skip: !serverId,
      refreshIntervalMs: pollMs,
      silentRefresh: true,
    },
  });

  const nextPollMs = serverId
    ? moduleStatusPollMs(
        inventory.$status === 'success'
          ? inventory.modules
          : inventory.$status === 'loading'
            ? inventory.prevData?.modules
            : undefined,
      )
    : 0;
  if (nextPollMs !== pollMs) setPollMs(nextPollMs);

  return [inventory, refetch] as const;
}
