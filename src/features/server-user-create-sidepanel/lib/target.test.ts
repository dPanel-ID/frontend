import { describe, expect, it } from 'vitest';

import { serverWorkspaceId, toServiceAccountOptions } from './target';

describe('serverWorkspaceId', () => {
  it('uses the workspace group of a team server', () => {
    expect(
      serverWorkspaceId({ workspace_type: 'group', workspace_id: '52' }),
    ).toBe('52');
  });

  it.each([{}, { organization_id: '0' }, { organization_id: 'personal' }])(
    'treats %j as a personal server',
    (server) => {
      expect(serverWorkspaceId(server)).toBeNull();
    },
  );
});

describe('toServiceAccountOptions', () => {
  it('keeps only workspace accounts with a username', () => {
    expect(
      toServiceAccountOptions({
        service_accounts: [
          { id: '1', name: 'Deploy', owner_kind: 'workspace', username: 'sa1' },
          { id: '2', name: 'Mine', owner_kind: 'user', username: 'me' },
          { id: '3', name: 'Broken', owner_kind: 'workspace' },
        ],
      }),
    ).toEqual([{ id: '1', name: 'Deploy', username: 'sa1' }]);
  });

  it('handles an empty list', () => {
    expect(toServiceAccountOptions({ service_accounts: null })).toEqual([]);
  });
});
