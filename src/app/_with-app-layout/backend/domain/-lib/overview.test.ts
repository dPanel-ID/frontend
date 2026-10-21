import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { summarizeDomains } from '../-models/overview';

const pagination = (totalItem: number) => ({ total_item: totalItem }) as never;

const domain = (over: Partial<DTOs.DomainV1>): DTOs.DomainV1 => ({
  id: 1,
  domain: 'example.com',
  name: 'Example',
  provider: 'CloudFlare',
  created_at: '2026-01-02 03:04:05',
  updated_at: '2026-01-02 03:04:05',
  ...over,
});

describe('summarizeDomains', () => {
  it('splits ownership and counts distinct providers', () => {
    const overview = summarizeDomains({
      domains: [
        domain({ id: 1, domain: 'a.com', provider: 'CloudFlare' }),
        domain({ id: 2, domain: 'b.com', provider: 'CloudFlare' }),
        domain({
          id: 3,
          domain: 'c.com',
          provider: 'DigitalOcean',
          organization: { id: 'o1', name: 'Platform' } as never,
        }),
      ],
      pagination: pagination(3),
    });

    expect(overview).toEqual({
      total: 3,
      providers: 2,
      team: 1,
      personal: 2,
      sampled: false,
    });
  });

  it('leaves an unknown provider out of the provider count', () => {
    const overview = summarizeDomains({
      domains: [
        domain({ id: 1, domain: 'a.com', provider: 'something-else' }),
        domain({ id: 2, domain: 'b.com', provider: undefined }),
      ],
      pagination: pagination(2),
    });

    expect(overview.providers).toBe(0);
    expect(overview.personal).toBe(2);
  });

  it('drops records the schema rejects instead of throwing', () => {
    const overview = summarizeDomains({
      domains: [
        domain({ id: 1, domain: 'a.com' }),
        // No parseable hostname: production still holds rows like this.
        domain({ id: 2, domain: '' }),
        domain({ id: 3, domain: 'not a domain' }),
      ],
      pagination: pagination(3),
    });

    expect(overview.total).toBe(3);
    expect(overview.personal).toBe(1);
  });

  it('marks the split as sampled when the workspace holds more', () => {
    const overview = summarizeDomains({
      domains: [domain({ id: 1, domain: 'a.com' })],
      pagination: pagination(120),
    });

    expect(overview.sampled).toBe(true);
    expect(overview.total).toBe(120);
  });

  it('survives a response without any domains', () => {
    expect(summarizeDomains({ pagination: pagination(0) })).toEqual({
      total: 0,
      providers: 0,
      team: 0,
      personal: 0,
      sampled: false,
    });
  });
});
