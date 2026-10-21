import { ApiSecret } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from '../events';

/**
 * Keys read for the overview tiles. The total still comes from the API, so
 * only the personal/team split is a sample.
 */
export const OVERVIEW_SAMPLE_SIZE = 100;

export interface SshKeysOverview {
  total: number;
  personal: number;
  team: number;
  /** True when the workspace holds more keys than the sample covers. */
  sampled: boolean;
}

/**
 * Counts across the workspace, independent of search and page, so the tiles
 * above the list describe every key the user has.
 */
export const [SshKeysOverviewModelProvider, useSshKeysOverviewModel] =
  buildSelector('SshKeysOverviewModel')(() => {
    const [response, refresh] = ApiSecret.SshKey.Find.useGet({
      page: 1,
      pageSize: OVERVIEW_SAMPLE_SIZE,
    });

    useSubscribe('@ssh-keys/data--refresh', () => {
      refresh();
    });

    return {
      overview: useAdapter(response, summarizeSshKeys),
    };
  });

export function summarizeSshKeys(raw: {
  secrets?: DTOs.SshKeyV1[];
  pagination: DTOs.Pagination;
}): SshKeysOverview {
  const secrets = raw.secrets ?? [];
  const overview: SshKeysOverview = {
    total: raw.pagination.total_item,
    personal: 0,
    team: 0,
    sampled: secrets.length < raw.pagination.total_item,
  };

  for (const secret of secrets) {
    if (isTeamKey(secret)) overview.team += 1;
    else overview.personal += 1;
  }

  return overview;
}

/** A key belongs to a team when the backend scoped it to an organization. */
export function isTeamKey(secret: DTOs.SshKeyV1) {
  return Boolean(secret.organization?.name || secret.organization_id);
}
