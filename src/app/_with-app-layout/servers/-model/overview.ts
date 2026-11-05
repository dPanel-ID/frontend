import { useAuthLoggedIn } from '@/services/auth';

import { ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';
import { useFilterModel } from './filters';

/** Servers counted for the overview tiles; beyond this the total still comes from the API. */
const OVERVIEW_SAMPLE_SIZE = 100;

export interface ServersOverview {
  total: number;
  ready: number;
  progress: number;
  failed: number;
  cloud: number;
  own: number;
}

/**
 * Counts by state across the workspace, independent of search, status and
 * page, so the tiles above the list describe the whole fleet.
 */
export const [ServersOverviewModelProvider, useServersOverviewModel] =
  buildSelector('ServersOverviewModel')(() => {
    const { id: userId } = useAuthLoggedIn().userProfile;
    const { ownership } = useFilterModel();

    const [response, refresh] = ApiServer.Find.useGet({
      filter: ownership,
      userId,
      pageSize: OVERVIEW_SAMPLE_SIZE,
      page: 1,
    });

    useSubscribe('@resources::servers/servers-refresh', () => refresh());

    return {
      ...useAdapter(response, (raw) => summarizeServers(raw)),
    };
  });

export function summarizeServers(raw: {
  machines?: DTOs.MachineV1[];
  pagination: DTOs.Pagination;
}): ServersOverview {
  const machines = raw.machines ?? [];
  const overview: ServersOverview = {
    total: raw.pagination.total_item,
    ready: 0,
    progress: 0,
    failed: 0,
    cloud: 0,
    own: 0,
  };

  for (const machine of machines) {
    if (machine.status === 'ready') overview.ready += 1;
    if (machine.status === 'progress') overview.progress += 1;
    if (machine.status === 'failed') overview.failed += 1;
    // Same rule as isCloudServer: manual servers report provider "other"
    // and private servers "private"; both are the user's own machines.
    if (
      machine.provider &&
      machine.provider !== 'other' &&
      machine.connectivity !== 'private'
    )
      overview.cloud += 1;
    else overview.own += 1;
  }

  return overview;
}
