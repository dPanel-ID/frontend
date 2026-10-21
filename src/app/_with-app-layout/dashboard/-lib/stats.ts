import type { DTOs } from '@/shared/api';

import { isInFlightLifecycle, needsAttentionLifecycle } from './activity';
import { resourceLifecycle } from './verdict';

export interface ResourceStats {
  ready: number;
  progress: number;
  attention: number;
  unknown: number;
}

/**
 * Status counts for one resource type, classified through the shared
 * lifecycle so an empty or legacy status is reported as unknown rather than
 * silently counted as healthy.
 */
export function buildResourceStats<T>(
  items: T[],
  readStatus: (item: T) => string | undefined,
): ResourceStats {
  return items.reduce<ResourceStats>(
    (acc, item) => {
      const lifecycle = resourceLifecycle(readStatus(item));

      if (lifecycle === 'succeeded') {
        acc.ready += 1;
      } else if (isInFlightLifecycle(lifecycle)) {
        acc.progress += 1;
      } else if (needsAttentionLifecycle(lifecycle)) {
        acc.attention += 1;
      } else {
        acc.unknown += 1;
      }

      return acc;
    },
    {
      ready: 0,
      progress: 0,
      attention: 0,
      unknown: 0,
    },
  );
}

export function buildServerStats(servers: DTOs.MachineV1[]) {
  return buildResourceStats(servers, (server) => server.status);
}

export function buildApplicationStats(applications: DTOs.ApplicationV1[]) {
  return buildResourceStats(applications, applicationInstallerStatus);
}

export function buildLoadBalancerStats(loadBalancers: DTOs.LoadBalancerV2[]) {
  return buildResourceStats(
    loadBalancers,
    (loadBalancer) => loadBalancer.installer_status,
  );
}

/** The newest installer status an application reported, artifact first. */
export function applicationInstallerStatus(application: DTOs.ApplicationV1) {
  return (
    application.artifacts?.[0]?.installer_status ||
    application.deploys?.[0]?.installer_status
  );
}

/**
 * Status counts for one estate tile. `counted` is how many records the page
 * actually inspected, which can be fewer than `total`; the tile then says so
 * rather than passing a sample off as the whole estate.
 */
export interface EstateStatus {
  total?: number;
  counted: number;
  ready: number;
  working: number;
  attention: number;
  unknown: number;
}

export function toEstateStatus(
  stats: ResourceStats,
  counted: number,
  total?: number,
): EstateStatus {
  return {
    total,
    counted,
    ready: stats.ready,
    working: stats.progress,
    attention: stats.attention,
    unknown: stats.unknown,
  };
}
