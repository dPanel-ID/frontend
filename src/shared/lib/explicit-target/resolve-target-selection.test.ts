import { describe, expect, it } from 'vitest';

import { resolveExplicitTargetSelection } from './resolve-target-selection';

describe('resolveExplicitTargetSelection', () => {
  it('keeps the server as the default target when both server and group are available', () => {
    expect(
      resolveExplicitTargetSelection({
        preferredMode: 'server',
        serverId: '45',
        hostGroup: {
          id: 'hg_1',
          label: 'API',
          memberCount: 2,
        },
      }),
    ).toEqual({
      activeMode: 'server',
      options: [
        {
          mode: 'server',
          label: 'Selected server',
          target: {
            type: 'server',
            id: '45',
          },
        },
        {
          mode: 'hostgroup',
          label: 'API',
          description: '2 members',
          target: {
            type: 'hostgroup',
            id: 'hg_1',
          },
        },
      ],
      target: {
        type: 'server',
        id: '45',
      },
    });
  });

  it('falls back to the host group when no server target exists', () => {
    expect(
      resolveExplicitTargetSelection({
        preferredMode: 'server',
        hostGroup: {
          id: 'hg_1',
          label: 'API',
          memberCount: 2,
        },
      }),
    ).toMatchObject({
      activeMode: 'hostgroup',
      target: {
        type: 'hostgroup',
        id: 'hg_1',
      },
    });
  });
});
