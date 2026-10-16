import { describe, expect, it } from 'vitest';

import { resolveOwnershipTeamId } from './resolveOwnershipTeamId';

describe('resolveOwnershipTeamId', () => {
  it('returns the group id for workspace resources', () => {
    expect(
      resolveOwnershipTeamId({
        workspace_type: 'group',
        workspace_id: '5209311491061018854',
      }),
    ).toBe('5209311491061018854');
  });

  it('ignores workspace_id on personal resources', () => {
    expect(
      resolveOwnershipTeamId({
        workspace_type: 'personal',
        workspace_id: '6254823876863624436',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the workspace is missing', () => {
    expect(resolveOwnershipTeamId({})).toBeUndefined();
    expect(
      resolveOwnershipTeamId({ workspace_type: 'group', workspace_id: ' ' }),
    ).toBeUndefined();
  });
});
