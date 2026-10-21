import { ApiCloud } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';
import { normalizeCloudProviderKey } from '@/shared/presentation/molecules/CloudProviderLogo';

import { cloudStatusBucket } from '../../-lib/describe-cloud-project';
import { useSubscribe } from '../events';

/**
 * Accounts read for the overview tiles. The total still comes from the API,
 * so only the per-state split is a sample.
 */
export const OVERVIEW_SAMPLE_SIZE = 100;

export interface CloudProjectsOverview {
  total: number;
  ready: number;
  progress: number;
  failed: number;
  /** Distinct providers among the sampled accounts. */
  providers: number;
  /** True when the workspace holds more accounts than the sample covers. */
  sampled: boolean;
}

/**
 * Counts by state across the workspace, independent of search, status and
 * page, so the tiles above the list describe every connected account.
 */
export const [CloudOverviewModelProvider, useCloudOverviewModel] =
  buildSelector('CloudOverviewModel')(() => {
    const [response, refresh] = ApiCloud.Project.Find.useGet({
      page: 1,
      pageSize: OVERVIEW_SAMPLE_SIZE,
    });

    useSubscribe('@cloud-projects/data--refresh', () => {
      refresh();
    });

    return {
      overview: useAdapter(response, summarizeCloudProjects),
    };
  });

export function summarizeCloudProjects(raw: {
  clouds?: DTOs.CloudProjectV1[];
  pagination: DTOs.Pagination;
}): CloudProjectsOverview {
  const clouds = raw.clouds ?? [];
  const providers = new Set<string>();
  const overview: CloudProjectsOverview = {
    total: raw.pagination.total_item,
    ready: 0,
    progress: 0,
    failed: 0,
    providers: 0,
    sampled: clouds.length < raw.pagination.total_item,
  };

  for (const cloud of clouds) {
    const bucket = cloudStatusBucket(cloud.installer_status?.trim() ?? '');
    if (bucket !== 'other') overview[bucket] += 1;

    const provider = normalizeCloudProviderKey(cloud.provider);
    if (provider) providers.add(provider);
  }

  overview.providers = providers.size;

  return overview;
}
