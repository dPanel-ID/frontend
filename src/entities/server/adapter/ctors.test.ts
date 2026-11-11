import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { ctorCloud, ctorCreator } from './ctors';

function machine(user?: Partial<DTOs.MachineV1['user']>): DTOs.MachineV1 {
  return { id: 112, user } as unknown as DTOs.MachineV1;
}

describe('ctorCreator', () => {
  it('uses the display name and links by username, never the email', () => {
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
      username: 'prakasa',
      avatarUrl: 'https://cdn.example/a.png',
    });
  });

  it('falls back from an empty display name to the username', () => {
    expect(
      ctorCreator(machine({ id: '1', fullname: ' ', username: 'nickyrolly1' }))
        ?.name,
    ).toBe('nickyrolly1');
  });

  it('is absent when the API could not resolve the creator', () => {
    expect(ctorCreator(machine())).toBeUndefined();
    expect(ctorCreator(machine({ id: '1' }))).toBeUndefined();
    expect(
      ctorCreator(machine({ id: '1', email: 'ops@example.com' })),
    ).toBeUndefined();
  });
});

describe('ctorCloud', () => {
  it.each([
    ['alibabacloud', 'alibabacloud'],
    ['Alibaba-Cloud', 'alibabacloud'],
    ['aliyun', 'alibabacloud'],
    ['tencent', 'tencent'],
    ['TencentCloud', 'tencent'],
    ['qcloud', 'tencent'],
  ])('maps provider %s to %s', (provider, expected) => {
    const raw = { id: 110, provider, region: 'ap-jakarta' };
    expect(ctorCloud(raw as unknown as DTOs.MachineV1)).toEqual({
      provider: expected,
      region: 'ap-jakarta',
    });
  });

  it('keeps the provider of a cloud VM that joined through its agent', () => {
    const raw = {
      id: 111,
      provider: 'gcp',
      region: 'asia-southeast2',
      connectivity: 'private',
      source: 'cloud-partner',
    };
    expect(ctorCloud(raw as unknown as DTOs.MachineV1)).toEqual({
      provider: 'googlecloud',
      region: 'asia-southeast2',
    });
  });

  it('has no cloud for a machine registered from its own terminal', () => {
    const raw = { id: 112, provider: 'private', connectivity: 'private' };
    expect(ctorCloud(raw as unknown as DTOs.MachineV1)).toBeUndefined();
  });
});
