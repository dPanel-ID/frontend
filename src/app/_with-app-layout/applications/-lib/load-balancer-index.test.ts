import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { indexLoadBalancersByApplication } from './load-balancer-index';

function router(overrides: Partial<DTOs.LoadBalancerV2>): DTOs.LoadBalancerV2 {
  return {
    id: '15',
    domain: 'wordpress.devetek.app',
    installer_status: 'ready',
    rules: [{ target: { application_id: '16' } }],
    ...overrides,
  } as DTOs.LoadBalancerV2;
}

describe('indexLoadBalancersByApplication', () => {
  // The router carries no top-level application_id; the only link is
  // through its rules, which is what made this easy to miss.
  it('maps a router to the application its rules target', () => {
    const index = indexLoadBalancersByApplication([router({})]);

    expect(index.get('16')).toEqual([
      {
        id: '15',
        domain: 'wordpress.devetek.app',
        href: 'https://wordpress.devetek.app',
        status: 'ready',
      },
    ]);
  });

  it('lists a router once however many rules point at the same app', () => {
    const index = indexLoadBalancersByApplication([
      router({
        rules: [
          { target: { application_id: '16' } },
          { target: { application_id: '16' } },
        ],
      }),
    ]);

    expect(index.get('16')).toHaveLength(1);
  });

  it('puts one router in front of several applications', () => {
    const index = indexLoadBalancersByApplication([
      router({
        rules: [
          { target: { application_id: '16' } },
          { target: { application_id: '17' } },
        ],
      }),
    ]);

    expect(index.get('16')).toHaveLength(1);
    expect(index.get('17')).toHaveLength(1);
  });

  it('collects several routers for one application', () => {
    const index = indexLoadBalancersByApplication([
      router({ id: '15', domain: 'a.example' }),
      router({ id: '16', domain: 'b.example' }),
    ]);

    expect(index.get('16')?.map((one) => one.domain)).toEqual([
      'a.example',
      'b.example',
    ]);
  });

  it('falls back to the layer-4 domain', () => {
    const index = indexLoadBalancersByApplication([
      router({ domain: undefined, domain_l4: 'tcp.example' }),
    ]);

    expect(index.get('16')?.[0]?.href).toBe('https://tcp.example');
  });

  it('keeps a router with no domain, since it still exists', () => {
    const index = indexLoadBalancersByApplication([
      router({ domain: undefined, domain_l4: undefined }),
    ]);

    expect(index.get('16')).toEqual([
      { id: '15', domain: undefined, href: undefined, status: 'ready' },
    ]);
  });

  it('ignores rules with no application and routers with no id', () => {
    expect(
      indexLoadBalancersByApplication([
        router({ rules: [{ target: {} }] }),
        router({ id: undefined }),
      ]).size,
    ).toBe(0);
  });

  it('survives nothing', () => {
    expect(indexLoadBalancersByApplication(undefined).size).toBe(0);
    expect(indexLoadBalancersByApplication(null).size).toBe(0);
  });
});
