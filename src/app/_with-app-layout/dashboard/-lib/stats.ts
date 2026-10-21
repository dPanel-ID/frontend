import type { DTOs } from '@/shared/api';

export function buildServerStats(servers: DTOs.MachineV1[]) {
  return servers.reduce(
    (acc, server) => {
      const status = String(server.status || '').toLowerCase();

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'progress' || status === 'deleting') {
        acc.progress += 1;
      } else if (status === 'failed' || status === 'cancelled') {
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

export function buildApplicationStats(applications: DTOs.ApplicationV1[]) {
  return applications.reduce(
    (acc, application) => {
      const status = String(
        application.artifacts?.[0]?.installer_status ||
          application.deploys?.[0]?.installer_status ||
          '',
      ).toLowerCase();

      if (application.app_config?.auto_deploy?.enabled) {
        acc.autoDeploy += 1;
      }

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'failed' || status === 'cancelled') {
        acc.attention += 1;
      }

      return acc;
    },
    {
      ready: 0,
      autoDeploy: 0,
      attention: 0,
    },
  );
}

export function buildLoadBalancerStats(loadBalancers: DTOs.LoadBalancerV2[]) {
  return loadBalancers.reduce(
    (acc, loadBalancer) => {
      const status = String(loadBalancer.installer_status || '').toLowerCase();

      if (status === 'ready') {
        acc.ready += 1;
      } else if (status === 'failed' || status === 'cancelled') {
        acc.attention += 1;
      }

      return acc;
    },
    {
      ready: 0,
      attention: 0,
    },
  );
}
