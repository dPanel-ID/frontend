import { describe, expect, it } from 'vitest';

import { toSelectableMachine } from './machine-options';

describe('toSelectableMachine', () => {
  it('preserves string ids and keeps machines without optional hostname or address', () => {
    expect(
      toSelectableMachine({
        id: 'server-alpha',
      }),
    ).toEqual({
      address: '',
      currentHostGroupId: undefined,
      hostname: 'server-alpha',
      id: 'server-alpha',
    });
  });

  it('returns null when the machine id is missing', () => {
    expect(
      toSelectableMachine({
        hostname: 'api-1',
      }),
    ).toBeNull();
  });
});
