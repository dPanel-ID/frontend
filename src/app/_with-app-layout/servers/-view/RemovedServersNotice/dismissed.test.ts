import { describe, expect, it } from 'vitest';

import type { ReturnedServerDto } from '@/shared/api/server.removed';

import { dismissAll, visibleReturnedServers } from './dismissed';

const server = (id: string, lastContact: string): ReturnedServerDto => ({
  machine_id: id,
  hostname: `host-${id}`,
  last_contact_at: lastContact,
});

describe('visibleReturnedServers', () => {
  it('hides a dismissed server until its agent calls again', () => {
    const before = [server('297', '2026-11-12T12:31:14Z')];
    const dismissed = dismissAll(before, {});
    expect(visibleReturnedServers(before, dismissed)).toEqual([]);

    const calledAgain = [server('297', '2026-11-13T08:00:00Z')];
    expect(visibleReturnedServers(calledAgain, dismissed)).toEqual(calledAgain);
  });

  it('keeps servers that were never dismissed', () => {
    const servers = [server('1', '2026-11-12T00:00:00Z')];
    expect(visibleReturnedServers(servers, {})).toEqual(servers);
  });
});
