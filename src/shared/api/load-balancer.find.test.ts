import { describe, expect, it } from 'vitest';

import { recipe } from './load-balancer.find';

describe('load balancer find recipe', () => {
  // The server overview kept counting a load balancer after it was deleted.
  it('asks for live load balancers only when told to', () => {
    const url = new URL(
      recipe({ machineId: '7', excludeDeleted: true, page: 1, limit: 1 }).url,
      'https://api.test',
    );

    expect(url.searchParams.get('exclude_deleted')).toBe('true');
    expect(url.searchParams.get('machine_id')).toBe('7');
  });

  it('lists every record, deleted ones too, by default', () => {
    const url = new URL(recipe({ machineId: '7' }).url, 'https://api.test');

    expect(url.searchParams.has('exclude_deleted')).toBe(false);
  });
});
