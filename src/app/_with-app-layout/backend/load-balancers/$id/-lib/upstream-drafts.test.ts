import { describe, expect, it } from 'vitest';

import { ctorConfiguration } from '@/entities/load-balancer/adapter/ctors';
import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';
import { configuration } from '@/entities/load-balancer/rules/schema/parts';

import type { DTOs } from '@/shared/api';

import {
  getApplicationDeploymentServers,
  getApplicationRouteTargets,
  getUpstreamDrafts,
  serializeUpstreamDraftRows,
  toLoadBalancerUpdatePayload,
} from './upstream-drafts';

const detailsFrom = (rules: DTOs.LoadBalancerRuleV2[]) =>
  ({
    configuration: configuration.parse(ctorConfiguration({ id: '91', rules })),
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

describe('changing the address mode of an application route', () => {
  const registered = detailsFrom([
    {
      path_match: '/',
      type: 'proxy_pass',
      wildcard: true,
      target: {
        application_id: '129',
        address_mode: 'registered',
        resolved_upstreams: [
          { address: '151.243.222.218', port: '8567', machine_id: '253' },
        ],
      },
    },
  ]);

  it('counts a changed mode as an unsaved change', () => {
    const rows = getUpstreamDrafts(registered);
    const changed = rows.map((row) => ({
      ...row,
      addressMode: 'private' as const,
    }));

    expect(serializeUpstreamDraftRows(changed)).not.toBe(
      serializeUpstreamDraftRows(rows),
    );
  });

  it('sends the new mode and no resolved addresses', () => {
    const rows = getUpstreamDrafts(registered).map((row) => ({
      ...row,
      addressMode: 'private' as const,
    }));

    expect(toLoadBalancerUpdatePayload(registered, rows).rules).toEqual([
      {
        addressMode: 'private',
        applicationId: '129',
        pathMatch: '/',
        type: 'proxy_pass',
        wildcard: true,
      },
    ]);
  });

  it('drops custom targets when a custom route switches to private', () => {
    const rows = getUpstreamDrafts(pinned).map((row) => ({
      ...row,
      addressMode: 'private' as const,
    }));
    const [rule] = toLoadBalancerUpdatePayload(pinned, rows).rules;

    expect(rule).toMatchObject({ addressMode: 'private', applicationId: '74' });
    expect(rule?.upstreams).toBeUndefined();
  });

  it('sends no mode for a new route the API should choose for', () => {
    const [rule] = toLoadBalancerUpdatePayload(registered, [
      {
        applicationId: '200',
        destination: 'app (#200)',
        id: 'draft-1',
        kind: 'application',
        match: '/*',
        order: 1,
        port: '80',
        protocol: 'http',
      },
    ]).rules;

    expect(rule).not.toHaveProperty('addressMode');
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
