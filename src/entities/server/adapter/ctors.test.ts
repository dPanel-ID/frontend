import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { ctorCreator } from './ctors';

function machine(user?: Partial<DTOs.MachineV1['user']>): DTOs.MachineV1 {
  return { id: 112, user } as unknown as DTOs.MachineV1;
}

describe('ctorCreator', () => {
  it('uses the display name, with email and avatar for the tooltip', () => {
    expect(
      ctorCreator(
        machine({
          id: '1',
          fullname: 'Amrih Prakasa',
          username: 'prakasa',
          email: 'prakasa@devetek.com',
          avatar_url: 'https://cdn.example/a.png',
        }),
      ),
    ).toEqual({
      name: 'Amrih Prakasa',
      email: 'prakasa@devetek.com',
      avatarUrl: 'https://cdn.example/a.png',
    });
  });

  it.each([
    [{ id: '1', fullname: ' ', username: 'nickyrolly1' }, 'nickyrolly1'],
    [{ id: '1', email: 'ops@example.com' }, 'ops@example.com'],
  ])('falls back from an empty display name: %o', (user, name) => {
    expect(ctorCreator(machine(user))?.name).toBe(name);
  });

  it('is absent when the API could not resolve the creator', () => {
    expect(ctorCreator(machine())).toBeUndefined();
    expect(ctorCreator(machine({ id: '1' }))).toBeUndefined();
  });
});
