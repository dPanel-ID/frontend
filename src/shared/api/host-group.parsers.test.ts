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
});
