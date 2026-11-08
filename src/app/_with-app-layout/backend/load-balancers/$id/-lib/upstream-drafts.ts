import type { ApplicationCard } from '@/entities/application/rules/schema';
import { normalizeLoadBalancerPathMatchForPayload } from '@/entities/load-balancer/lib/path-match';
import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';

import type { DTOs } from '@/shared/api';
import type { RecipeRule } from '@/shared/api/load-balancer.create';
import type { Response } from '@/shared/libs/api-client/rules/types';

import type { UpstreamDraft } from './types';

export function getRouteCount(details: LoadBalancerDetails) {
  if (details.configuration.lbKind === 'l4') {
    return details.configuration.upstreams.length;
  }

  return details.configuration.rules.length;
}

export function getUpstreamDrafts(
  details: LoadBalancerDetails,
): UpstreamDraft[] {
  if (details.configuration.lbKind === 'l4') {
    return details.configuration.upstreams.map((upstream, index) => ({
      destination: upstream.address,
      id: `l4-${index}-${upstream.address}-${upstream.port}`,
      kind: 'address',
      match: 'TCP',
      order: index + 1,
      port: String(upstream.port || ''),
      protocol: 'tcp',
    }));
  }

  const rows: UpstreamDraft[] = [];

  details.configuration.rules.forEach((rule, ruleIndex) => {
    const upstream = rule.upstream;
    const baseOrder = ruleIndex + 1;

    if (upstream.type === 'proxy-pass-app') {
      const applicationId = upstream.target.applicationId;

      rows.push({
        addressMode: upstream.target.addressMode,
        applicationUpstreams: upstream.target.upstreams,
        resolvedUpstreams: upstream.target.resolvedUpstreams,
        applicationId,
        destination: formatApplicationBackendDestination(
          `Application ${applicationId}`,
          applicationId,
        ),
        href: `/applications/${applicationId}`,
        id: `app-${ruleIndex}-${applicationId}`,
        kind: 'application',
        match: upstream.matchingPath,
        order: baseOrder,
        port: String(upstream.target.port > -1 ? upstream.target.port : ''),
        protocol: 'http',
      });
      return;
    }

    if (upstream.type === 'static-file') {
      rows.push({
        destination: upstream.filePath.join(', '),
        id: `static-${ruleIndex}-${upstream.filePath.join('-')}`,
        kind: 'static',
        match: upstream.matchingPath,
        order: baseOrder,
        port: '',
        protocol: 'file',
      });
      return;
    }

    upstream.backendTarget.forEach((target, targetIndex) => {
      rows.push({
        destination: target.address.hostname,
        id: `address-${ruleIndex}-${targetIndex}-${target.address.hostname}-${target.port}`,
        kind: 'address',
        match: upstream.matchingPath,
        order: baseOrder + targetIndex,
        port: String(target.port || ''),
        protocol: target.address.protocol,
      });
    });
  });

  return rows.map((row, index) => ({
    ...row,
    order: index + 1,
  }));
}

export function normalizeDraftRowOrder(rows: UpstreamDraft[]) {
  return rows.map((row, index) => ({
    ...row,
    order: index + 1,
  }));
}

export function getUpstreamDraftDisplay(
  row: UpstreamDraft,
  responseApplication: Response<DTOs.ApplicationV1>,
) {
  if (row.kind !== 'application' || responseApplication.$status !== 'success') {
    return {
      destination: row.destination,
      port: row.port,
    };
  }

  const applicationId = String(
    responseApplication.id ??
      row.applicationId ??
      getApplicationIdFromDraftRow(row),
  );
  const applicationName =
    responseApplication.name ||
    row.destination ||
    `Application ${applicationId}`;

  return {
    destination: formatApplicationBackendDestination(
      applicationName,
      applicationId,
    ),
    port: getApplicationDtoRuntimePort(responseApplication) || row.port,
  };
}

export function formatApplicationBackendDestination(
  name: string,
  applicationId: string,
) {
  return `${name} (#${applicationId})`;
}

export function getApplicationCardRuntimePort(application: ApplicationCard) {
  const port = application.configDefs.lifecycle?.run.port;

  return port ? String(port) : '';
}

export function getApplicationDtoRuntimePort(application: DTOs.ApplicationV1) {
  const port = application.app_definition?.run?.port;

  return port ? String(port) : '';
}

export function serializeUpstreamDraftRows(rows: UpstreamDraft[]) {
  return JSON.stringify(
    rows.map((row) => ({
      applicationId: row.applicationId ?? '',
      destination: row.destination.trim(),
      href: row.href ?? '',
      kind: row.kind,
      match: row.match.trim(),
      port: row.port.trim(),
      protocol: row.protocol,
    })),
  );
}

export function areUpstreamDraftRowsValid(
  details: LoadBalancerDetails,
  rows: UpstreamDraft[],
) {
  if (rows.length === 0) return false;

  return rows.every((row) => {
    const hasMatch =
      details.configuration.lbKind === 'l4' || row.match.trim().length > 0;

    if (!hasMatch) return false;

    if (row.kind === 'application') {
      return getApplicationIdFromDraftRow(row).length > 0;
    }

    if (row.kind === 'static') {
      return row.destination.trim().length > 0;
    }

    const port = Number(row.port);

    return (
      row.destination.trim().length > 0 &&
      Number.isInteger(port) &&
      port >= 1 &&
      port <= 65_535
    );
  });
}

export function toLoadBalancerUpdatePayload(
  details: LoadBalancerDetails,
  rows: UpstreamDraft[],
): { defaultUpstream?: string; rules: RecipeRule[] } {
  const rules = rows.map((row) =>
    toLoadBalancerUpdateRule(details.configuration.lbKind, row),
  );

  return {
    defaultUpstream: getDefaultUpstreamFromDraftRows(rows),
    rules,
  };
}

export function toLoadBalancerUpdateRule(
  lbKind: LoadBalancerDetails['configuration']['lbKind'],
  row: UpstreamDraft,
): RecipeRule {
  const route = normalizeLoadBalancerPathMatchForPayload(
    lbKind === 'l4' ? '/' : row.match,
  );

  if (row.kind === 'application') {
    // Send the stored address mode (and a custom route's upstreams) back
    // as they are, so saving never changes how an untouched route is reached.
    const customUpstreams =
      row.addressMode === 'custom' ? row.applicationUpstreams : undefined;

    return {
      applicationId: getApplicationIdFromDraftRow(row),
      pathMatch: route.pathMatch,
      type: 'proxy_pass',
      wildcard: route.wildcard,
      ...(row.addressMode ? { addressMode: row.addressMode } : {}),
      ...(customUpstreams?.length
        ? {
            upstreams: customUpstreams.map((upstream) => ({
              address: upstream.scheme
                ? `${upstream.scheme}://${upstream.address}`
                : upstream.address,
              port: upstream.port,
            })),
          }
        : {}),
    };
  }

  if (row.kind === 'static') {
    return {
      pathMatch: route.pathMatch,
      type: 'static',
      wildcard: route.wildcard,
    };
  }

  return {
    pathMatch: route.pathMatch,
    type: 'proxy_pass',
    upstreams: [
      {
        address: row.destination.trim(),
        port: row.port.trim(),
      },
    ],
    wildcard: route.wildcard,
  };
}

export interface ApplicationRouteTarget {
  /** address:port, with the scheme when the upstream was given as a URL. */
  address: string;
  machineId?: string;
  /** Server name from the application's deployments, when known. */
  serverName?: string;
}

/**
 * Where an application route sends traffic: a custom route's own upstreams,
 * otherwise the addresses recorded at the last apply, each named by its
 * deployment's server. Empty until the load balancer is applied once.
 */
export function getApplicationRouteTargets(
  row: UpstreamDraft,
  servers: ReadonlyMap<string, string> = new Map(),
): ApplicationRouteTarget[] {
  const upstreams =
    row.addressMode === 'custom' && row.applicationUpstreams?.length
      ? row.applicationUpstreams
      : (row.resolvedUpstreams ?? []);

  return upstreams.map((upstream) => {
    const host = upstream.address.includes(':')
      ? `[${upstream.address.replace(/^\[|\]$/g, '')}]`
      : upstream.address;
    const hostPort = upstream.port ? `${host}:${upstream.port}` : host;

    return {
      address: upstream.scheme ? `${upstream.scheme}://${hostPort}` : hostPort,
      ...(upstream.machineId
        ? {
            machineId: upstream.machineId,
            serverName: servers.get(upstream.machineId),
          }
        : {}),
    };
  });
}

/** Server names of an application's deployments, by machine ID. */
export function getApplicationDeploymentServers(
  application: DTOs.ApplicationV1 | undefined,
) {
  const servers = new Map<string, string>();

  for (const deploy of application?.deploys ?? []) {
    const machineId = deploy.machine_id ?? deploy.machine?.id;
    if (machineId === undefined) continue;

    const name = deploy.machine?.hostname;
    if (name) servers.set(String(machineId), name);
  }

  return servers;
}

export function getApplicationIdFromDraftRow(row: UpstreamDraft) {
  if (row.applicationId) return row.applicationId;

  const hrefMatch = row.href?.match(/\/applications\/([^/?#]+)/);
  const hrefId = hrefMatch?.[1];

  if (hrefId) return decodeURIComponent(hrefId);

  const destinationMatch = row.destination.match(/Application\s*#([^\s]+)/i);

  return destinationMatch?.[1]?.trim() ?? '';
}

export function getDefaultUpstreamFromDraftRows(rows: UpstreamDraft[]) {
  const firstAddressRow = rows[0]?.kind === 'address' ? rows[0] : undefined;

  if (!firstAddressRow) return undefined;

  return `${firstAddressRow.destination.trim()}:${firstAddressRow.port.trim()}`;
}

export function createDraftBackendId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
