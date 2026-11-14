import { describe, expect, it } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import { getForgetOffer } from './use-delete-server';

const conflict = (data: unknown) =>
  new BaseResponseError({
    code: 409,
    status: 'failed',
    error: 'server still has linked resources',
    data,
  });

describe('getForgetOffer', () => {
  it('offers to remove a gone server with its resources', () => {
    expect(
      getForgetOffer(
        conflict({
          application_deployments: 1,
          application_artifacts: 3,
          load_balancers: 0,
          total_blocking_resources: 4,
          can_forget: true,
          reachability: {
            unreachable: true,
            reason: 'agent_offline',
            last_seen_at: '2026-11-07T01:59:00Z',
          },
        }),
      ),
    ).toEqual({
      deployments: 1,
      artifacts: 3,
      loadBalancers: 0,
      lastSeenAt: '2026-11-07T01:59:00Z',
      reason: 'agent_offline',
    });
  });

  it('offers nothing for a reachable server', () => {
    expect(
      getForgetOffer(
        conflict({
          application_artifacts: 3,
          total_blocking_resources: 3,
          can_forget: false,
        }),
      ),
    ).toBeNull();
  });

  it('offers nothing for other errors', () => {
    expect(getForgetOffer(new Error('network'))).toBeNull();
  });
});

describe('getForgetOffer on a cloud server', () => {
  const base = {
    application_deployments: 0,
    application_artifacts: 1,
    load_balancers: 0,
    total_blocking_resources: 1,
    can_forget: true,
    reachability: { unreachable: true, reason: 'agent_offline' },
  };

  it('asks for the VM confirmation when the provider cannot be checked', () => {
    expect(
      getForgetOffer(
        conflict({
          ...base,
          cloud_vm: { provider: 'digitalocean', result: 'unverifiable' },
        }),
      )?.unverifiedCloudProvider,
    ).toBe('digitalocean');
  });

  it('needs no VM confirmation when the provider says the VM is gone', () => {
    expect(
      getForgetOffer(
        conflict({ ...base, cloud_vm: { provider: 'gcp', result: 'gone' } }),
      )?.unverifiedCloudProvider,
    ).toBeUndefined();
  });
});
