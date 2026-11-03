import { describe, expect, it } from 'vitest';

import { isDpanelAdmin } from './admin-role';

describe('isDpanelAdmin', () => {
  it.each([
    [['dpanel/dpanel-admin'], true],
    [['dpanel-admin'], true],
    [['DPanel/DPANEL-Admin'], true],
    [['other-org/dpanel-admin'], true],
    [['dpanel/member', 'dpanel/dpanel-admin'], true],
  ])('accepts %j', (roles, expected) => {
    expect(isDpanelAdmin(roles)).toBe(expected);
  });

  it.each([
    [undefined],
    [null],
    [[]],
    [['dpanel/member']],
    [['dpanel/dpanel-admin-lite']],
    [['dpanel-admin/owner']],
    [['owner', 'member']],
    [[42, null, { name: 'dpanel-admin' }]],
    [['']],
  ])('rejects %j', (roles) => {
    expect(isDpanelAdmin(roles as never)).toBe(false);
  });
});
