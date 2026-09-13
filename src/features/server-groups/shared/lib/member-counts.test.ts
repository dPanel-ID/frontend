import { describe, expect, it } from 'vitest';

import { buildHostGroupMemberCountMap } from './member-counts';

describe('buildHostGroupMemberCountMap', () => {
  it('derives counts from host-group detail members instead of summary placeholders', () => {
    expect(
      buildHostGroupMemberCountMap([
        {
          id: 'hg_1',
          members: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
        {
          id: 'hg_2',
          members: [{ id: '9' }],
        },
      ]),
    ).toEqual({
      hg_1: 3,
      hg_2: 1,
    });
  });

  it('treats missing members as an unavailable count instead of inventing zero', () => {
    expect(
      buildHostGroupMemberCountMap([
        {
          id: 'hg_1',
        },
      ]),
    ).toEqual({});
  });
});
