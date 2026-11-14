import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import {
  loadBalancerStatusBucket,
  summarizeLoadBalancers,
} from '../-models/overview';

const pagination = (totalItem: number) => ({ total_item: totalItem }) as never;

const router = (over: Partial<DTOs.LoadBalancerV2>): DTOs.LoadBalancerV2 =>
  ({
    id: '1',
    domain: 'https://app.example.com',
    engine: 'caddy',
    type: 'l7',
    installer_status: 'ready',
    rules: [
      {
        path_match: '/',
        target: { upstreams: [{ address: '127.0.0.1', port: '3000' }] },
      },
    ],
    created_at: '2026-01-02 03:04:05',
    updated_at: '2026-01-02 03:04:05',
    ...over,
  });

describe('loadBalancerStatusBucket', () => {
  it('buckets the backend router vocabulary', () => {
    expect(loadBalancerStatusBucket('ready')).toBe('ready');
    expect(loadBalancerStatusBucket('pending')).toBe('progress');
    expect(loadBalancerStatusBucket('progress')).toBe('progress');
    expect(loadBalancerStatusBucket('deleting')).toBe('progress');
    expect(loadBalancerStatusBucket('failed')).toBe('failed');
    expect(loadBalancerStatusBucket('cancelled')).toBe('failed');
  });

  it('keeps unknown and terminal values out of the healthy bucket', () => {
    expect(loadBalancerStatusBucket('')).toBe('other');
    expect(loadBalancerStatusBucket('deleted')).toBe('other');
    expect(loadBalancerStatusBucket('unknown')).toBe('other');
    expect(loadBalancerStatusBucket('something-new')).toBe('other');
  });
});

describe('summarizeLoadBalancers', () => {
  it('reports the exact total even when nothing parses', () => {
    const overview = summarizeLoadBalancers({
      domains: undefined,
      routers: [],
      pagination: pagination(7),
    } as never);

    expect(overview.total).toBe(7);
    expect(overview.ready).toBe(0);
    expect(overview.gateways).toBe(0);
  });

  it('drops records the schema rejects instead of throwing', () => {
    const overview = summarizeLoadBalancers({
      routers: [
        router({ id: '1', domain: 'https://a.example.com' }),
        // No parseable domain: production still holds rows like this. An
        // empty string is NOT one of them, it still yields a card.
        router({ id: '2', domain: 'not a url at all' }),
        router({ id: '3', domain: 'bare' }),
      ],
      pagination: pagination(3),
    });

    expect(overview.total).toBe(3);
    expect(overview.ready).toBe(1);
  });

  it('drops an L7 load balancer that has no routing rules yet', () => {
    // schemaLoadBalancerCard requires rules.min(1) for an l7 configuration,
    // so a router still being provisioned cannot be represented at all.
    const overview = summarizeLoadBalancers({
      routers: [
        router({
          id: '1',
          domain: 'https://pending.example.com',
          installer_status: 'progress',
          rules: [],
          upstream: undefined,
        }),
      ],
      pagination: pagination(1),
    });

    expect(overview.total).toBe(1);
    expect(overview.progress).toBe(0);
  });

  it('marks the counts as sampled when the workspace holds more', () => {
    const overview = summarizeLoadBalancers({
      routers: [router({ id: '1', domain: 'https://a.example.com' })],
      pagination: pagination(120),
    });

    expect(overview.sampled).toBe(true);
    expect(overview.total).toBe(120);
  });

  it('survives a response with no routers at all', () => {
    expect(summarizeLoadBalancers({ pagination: pagination(0) })).toEqual({
      total: 0,
      ready: 0,
      progress: 0,
      failed: 0,
      gateways: 0,
      sampled: false,
    });
  });
});
