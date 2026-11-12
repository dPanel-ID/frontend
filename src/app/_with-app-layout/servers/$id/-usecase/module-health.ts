import { useMemo } from 'react';

import { ApiServer } from '@/shared/api';

import { indexModuleHealth } from '../-lib/module-health';
import type { ModuleHealthIndex } from '../-lib/module-health';

/** How often the server's module services are checked while a page shows them. */
const MODULE_HEALTH_REFRESH_MS = 60_000;

/**
 * Whether each installed module's services run, read live through the
 * server's agent. Empty while loading or when the agent cannot be asked.
 */
export function useModuleHealth(serverId: string): ModuleHealthIndex {
  const [response] = ApiServer.Modules.$Id.Health.useGet({
    serverId,
    options: { skip: !serverId, refreshIntervalMs: MODULE_HEALTH_REFRESH_MS },
  });
  const modules =
    response.$status === 'success'
      ? response.modules
      : response.$status === 'loading'
        ? response.prevData?.modules
        : undefined;
  return useMemo(() => indexModuleHealth(modules), [modules]);
}
