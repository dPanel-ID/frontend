import { describe, expect, it } from 'vitest';

import { myTeamAccess, teamAccessOf, teamWorkspaces } from './team-roles';

describe('teamAccessOf', () => {
  it.each([
    [['2430473335433071236:owner'], 'owner'],
    [['billing', 'workspace-admin', 'developer'], 'admin'],
    [['acme-role-admin'], 'admin'],
    [['billing', 'viewer'], 'member'],
    [['acme-role-member'], 'member'],
    [[], 'member'],
    [[null, undefined, ' '], 'member'],
  ])('%o grants %s', (roles, access) => {
    expect(teamAccessOf(roles)).toBe(access);
  });

  it('keeps the strongest access when roles mix', () => {
    expect(teamAccessOf(['viewer', 'admin', 'owner'])).toBe('owner');
  });
});

describe('profile workspaces', () => {
  const workspaces = [
    { id: 'personal', type: 'personal', name: 'Personal mode' },
    {
      id: '5209311491061018854',
      type: 'group',
      name: 'Devetek Inc',
      roles: ['5209311491061018854:owner'],
    },
    {
      id: '2430473335433071236',
      type: 'group',
      name: 'BBO',
      roles: ['2430473335433071236:workspace-admin'],
    },
  ];

  it('counts teams without the personal workspace', () => {
    expect(teamWorkspaces(workspaces).map((team) => team.name)).toEqual([
      'Devetek Inc',
      'BBO',
    ]);
    expect(teamWorkspaces(undefined)).toEqual([]);
  });

  it('reads your access per team, or none when you are not in it', () => {
    expect(myTeamAccess(workspaces, '5209311491061018854')).toBe('owner');
    expect(myTeamAccess(workspaces, '2430473335433071236')).toBe('admin');
    expect(myTeamAccess(workspaces, '999')).toBeUndefined();
    expect(myTeamAccess(workspaces, 'personal')).toBeUndefined();
  });
});
