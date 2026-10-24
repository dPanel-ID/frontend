import { AdapterApplicationFromDto } from '@/entities/application/adapter';

import { ApiApplication } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { applicationBucket } from '../-lib/describe-application';

import { useSubscribe } from './events';

/**
 * Applications read for the overview tiles. The total still comes from the
 * API, so only the per-state split is a sample.
 */
export const OVERVIEW_SAMPLE_SIZE = 100;

export interface ApplicationsOverview {
  total: number;
  running: number;
  building: number;
  attention: number;
  /** True when the workspace holds more applications than the sample. */
  sampled: boolean;
}

/**
 * Counts by state across the workspace, independent of search and page, so
 * the tiles above the list describe every application.
 */
export const [AppsOverviewModelProvider, useAppsOverviewModel] = buildSelector(
  'AppsOverviewModel',
)(() => {
  const [response, refresh] = ApiApplication.Find.useGet({
    page: 1,
    limit: OVERVIEW_SAMPLE_SIZE,
  });

  useSubscribe('@applications/application-refresh', () => refresh());

  return {
    overview: useAdapter(response, summarizeApplications),
  };
});

export function summarizeApplications(raw: {
  applications?: DTOs.ApplicationV1[];
  pagination: DTOs.Pagination;
}): ApplicationsOverview {
  const applications = raw.applications ?? [];
  const overview: ApplicationsOverview = {
    total: raw.pagination.total_item,
    running: 0,
    building: 0,
    attention: 0,
    sampled: applications.length < raw.pagination.total_item,
  };

  for (const dto of applications) {
    const card = AdapterApplicationFromDto.toApplicationCard(dto).okay();
    if (!card) continue;

    const bucket = applicationBucket(card);
    if (bucket !== 'other') overview[bucket] += 1;
  }

  return overview;
}
