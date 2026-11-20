import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { buildServerStats, liveServers } from './stats';

const server = (id: number, status?: string) =>
  ({ id, hostname: `server-${id}`, status }) as unknown as DTOs.MachineV1;

// A deleted server (360, probe-x) stayed in the server list and was counted
// on the dashboard (2026-11-20).
describe('liveServers', () => {
  it('leaves deleted servers out', () => {
    const servers = [
      server(1, 'ready'),
      server(2, 'deleted'),
      server(3, 'Deleted '),
      server(4, 'deleting'),
      server(5),
    ];

    expect(liveServers(servers).map((item) => item.id)).toEqual([1, 4, 5]);
  });

  it('keeps a deleted server out of the counts', () => {
    const stats = buildServerStats(
      liveServers([server(1, 'ready'), server(2, 'deleted')]),
    );

    expect(stats).toEqual({ ready: 1, progress: 0, attention: 0, unknown: 0 });
  });
});
