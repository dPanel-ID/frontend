import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { summarizeServers } from './overview';

describe('summarizeServers', () => {
  it('counts only known providers as cloud', () => {
    const machines = [
      { id: 1, status: 'ready', provider: 'gcp' },
      { id: 2, status: 'ready', provider: 'other' },
      { id: 3, status: 'ready', provider: 'private', connectivity: 'private' },
      { id: 4, status: 'failed' },
    ] as DTOs.MachineV1[];

    const overview = summarizeServers({
      machines,
      pagination: { total_item: 4 } as DTOs.Pagination,
    });

    expect(overview.cloud).toBe(1);
    expect(overview.own).toBe(3);
    expect(overview.ready).toBe(3);
    expect(overview.failed).toBe(1);
  });

  it('counts a cloud VM that joined through its agent as cloud', () => {
    const machines = [
      {
        id: 5,
        status: 'progress',
        provider: 'gcp',
        connectivity: 'private',
        source: 'cloud-partner',
      },
    ] as DTOs.MachineV1[];

    const overview = summarizeServers({
      machines,
      pagination: { total_item: 1 } as DTOs.Pagination,
    });

    expect(overview.cloud).toBe(1);
    expect(overview.own).toBe(0);
  });
});
