import { describe, expect, it } from 'vitest';

import {
  parseHostGroupDetailPayload,
  parseHostGroupListPayload,
} from './host-group.parsers';

const base = {
  id: 'hg_1',
  name: 'Edge',
  workspace_id: 'org_1',
  workspace_type: 'group',
  created_at: '2026-11-04T00:00:00Z',
  updated_at: '2026-11-04T00:00:00Z',
};

describe('host group parsers', () => {
  it('accepts the kind and cluster summary the API sends', () => {
    const [generic, cluster] = parseHostGroupListPayload([
      { ...base, kind: 'generic' },
      {
        ...base,
        id: 'hg_2',
        kind: 'kubernetes',
        cluster: {
          id: 'cl_1',
          kind: 'kubernetes',
          engine: 'k3s',
          status: 'ready',
        },
      },
    ]);
    expect(generic?.kind).toBe('generic');
    expect(cluster?.cluster?.status).toBe('ready');
  });

  it('accepts kind on group detail', () => {
    const detail = parseHostGroupDetailPayload({
      ...base,
      kind: 'generic',
      members: [],
    });
    expect(detail.kind).toBe('generic');
  });

  it('accepts private server members and ignores fields it does not know', () => {
    const detail = parseHostGroupDetailPayload({
      ...base,
      kind: 'generic',
      members: [
        {
          id: '206',
          hostname: 'home-server',
          connectivity: 'private',
          lan_address: '192.168.1.20',
          some_future_field: true,
        },
      ],
    });
    const [member] = detail.members;
    expect(member?.connectivity).toBe('private');
    expect(member?.lan_address).toBe('192.168.1.20');
    expect(member).not.toHaveProperty('some_future_field');
  });
});
