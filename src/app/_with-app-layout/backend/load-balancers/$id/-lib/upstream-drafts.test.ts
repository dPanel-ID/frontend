import { describe, expect, it } from 'vitest';

import { ctorConfiguration } from '@/entities/load-balancer/adapter/ctors';
import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';
import { configuration } from '@/entities/load-balancer/rules/schema/parts';

import type { DTOs } from '@/shared/api';

import {
  getApplicationDeploymentServers,
  getApplicationRouteTargets,
  getUpstreamDrafts,
  toLoadBalancerUpdatePayload,
} from './upstream-drafts';

const detailsFrom = (rules: DTOs.LoadBalancerRuleV2[]) =>
  ({
    configuration: configuration.parse(
      ctorConfiguration({ id: '91', rules }),
    ),
  }) as LoadBalancerDetails;

const pinned = detailsFrom([
  {
    path_match: '/',
    type: 'proxy_pass',
    wildcard: true,
    target: {
      application_id: '74',
      address_mode: 'custom',
      upstreams: [{ address: '10.0.16.230', port: '8028' }],
    },
  },
]);

const spread = detailsFrom([
  {
    path_match: '/',
    type: 'proxy_pass',
    wildcard: true,
    target: {
      application_id: '73',
      address_mode: 'private',
      resolved_upstreams: [
        { address: '10.0.16.230', port: '8027', machine_id: '253' },
        { address: '10.0.16.232', port: '8027', machine_id: '256' },
      ],
    },
  },
]);

describe('saving application routes', () => {
  it('keeps an untouched custom route exactly as stored', () => {
    const payload = toLoadBalancerUpdatePayload(
      pinned,
      getUpstreamDrafts(pinned),
    );

    expect(payload.rules).toEqual([
      {
        addressMode: 'custom',
        applicationId: '74',
        pathMatch: '/',
        type: 'proxy_pass',
        upstreams: [{ address: '10.0.16.230', port: '8028' }],
        wildcard: true,
      },
    ]);
  });

  it('keeps the mode of a private route without sending resolved addresses', () => {
    const [rule] = toLoadBalancerUpdatePayload(
      spread,
      getUpstreamDrafts(spread),
    ).rules;

    expect(rule).toMatchObject({ addressMode: 'private', applicationId: '73' });
    expect(rule?.upstreams).toBeUndefined();
  });

  it('sends a custom URL origin back as a URL', () => {
    const details = detailsFrom([
      {
        path_match: '/',
        target: {
          application_id: '9',
          address_mode: 'custom',
          upstreams: [
            { address: 'origin.example.com', port: '443', scheme: 'https' },
          ],
        },
      },
    ]);
    const [rule] = toLoadBalancerUpdatePayload(
      details,
      getUpstreamDrafts(details),
    ).rules;

    expect(rule?.upstreams).toEqual([
      { address: 'https://origin.example.com', port: '443' },
    ]);
  });
});

describe('getApplicationRouteTargets', () => {
  it('lists a custom route by its own upstreams', () => {
    const [row] = getUpstreamDrafts(pinned);

    expect(row?.addressMode).toBe('custom');
    expect(getApplicationRouteTargets(row!)).toEqual([
      { address: '10.0.16.230:8028' },
    ]);
  });

  it('names each resolved deployment by its server', () => {
    const [row] = getUpstreamDrafts(spread);
    const servers = getApplicationDeploymentServers({
      deploys: [
        { machine_id: 253, machine: { id: 253, hostname: 'etos-app-01' } },
        { machine_id: 256, machine: { id: 256 } },
      ],
    });

    expect(getApplicationRouteTargets(row!, servers)).toEqual([
      {
        address: '10.0.16.230:8027',
        machineId: '253',
        serverName: 'etos-app-01',
      },
      { address: '10.0.16.232:8027', machineId: '256', serverName: undefined },
    ]);
  });

  it('is empty for a route not applied since targets were recorded', () => {
    const details = detailsFrom([
      { path_match: '/', target: { application_id: '5' } },
    ]);
    const [row] = getUpstreamDrafts(details);

    expect(row?.addressMode).toBeUndefined();
    expect(getApplicationRouteTargets(row!)).toEqual([]);
  });
});
