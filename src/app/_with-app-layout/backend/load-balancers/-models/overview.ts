import { AdapterLoadBalancerFromDto } from '@/entities/load-balancer/adapter';

import { ApiLoadBalancer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { useSubscribe } from './events';

/**
 * Load balancers read for the overview tiles. The total still comes from the
 * API, so only the per-state split and the gateway count are a sample.
 */
export const OVERVIEW_SAMPLE_SIZE = 100;

export interface LoadBalancersOverview {
  total: number;
  ready: number;
  progress: number;
  failed: number;
  /** Distinct gateway servers answering traffic for them. */
  gateways: number;
  /** True when the workspace holds more than the sample covers. */
  sampled: boolean;
}

/**
 * Counts by state across the workspace, independent of search, status and
 * page, so the tiles above the list describe every load balancer.
 */
export const [LbOverviewModelProvider, useLbOverviewModel] = buildSelector(
  'LbOverviewModel',
)(() => {
  const [response, refresh] = ApiLoadBalancer.Find.useGet({
    page: 1,
    pageSize: OVERVIEW_SAMPLE_SIZE,
  });

  useSubscribe('@load-balancers/data--refresh', () => {
    refresh();
  });

  return {
    overview: useAdapter(response, summarizeLoadBalancers),
  };
});

export function summarizeLoadBalancers(raw: {
  routers?: DTOs.LoadBalancerV2[];
  pagination: DTOs.Pagination;
}): LoadBalancersOverview {
  const routers = raw.routers ?? [];
  const gateways = new Set<string>();
  const overview: LoadBalancersOverview = {
    total: raw.pagination.total_item,
    ready: 0,
    progress: 0,
    failed: 0,
    gateways: 0,
    sampled: routers.length < raw.pagination.total_item,
  };

  for (const router of routers) {
    const card = AdapterLoadBalancerFromDto.toLoadBalancerCard(router).okay();
    if (!card) continue;

    const bucket = loadBalancerStatusBucket(card.state.status);
    if (bucket !== 'other') overview[bucket] += 1;

    const gatewayId = card.gateway?.server.id;
    if (gatewayId) gateways.add(gatewayId);
  }

  overview.gateways = gateways.size;

  return overview;
}

export type LoadBalancerStatusBucket =
  | 'ready'
  | 'progress'
  | 'failed'
  | 'other';

/**
 * Buckets the backend's router status vocabulary: pending, progress,
 * cancelled, ready, deleting, failed, deleted. Anything unrecognised stays
 * out of the healthy bucket rather than being counted as serving traffic.
 */
export function loadBalancerStatusBucket(
  status: string,
): LoadBalancerStatusBucket {
  switch (status) {
    case 'ready':
      return 'ready';

    case 'pending':
    case 'progress':
    case 'deleting':
      return 'progress';

    case 'failed':
    case 'cancelled':
      return 'failed';

    default:
      return 'other';
  }
}
