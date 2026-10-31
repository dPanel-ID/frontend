import type z from 'zod';

import type { DTOs } from '@/shared/api';
import type { KeysOnly, KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { cloud, creator, specs } from '../rules/schema/parts';

/** The creator as the API resolves them from the server's owner subject. */
export function ctorCreator(
  raw: DTOs.MachineV1,
): KeysOnly<z.input<typeof creator>> | undefined {
  const { user } = raw;
  const email = user?.email?.trim() || undefined;
  const name = user?.fullname?.trim() || user?.username?.trim() || email;

  if (!name) return undefined;

  return {
    name,
    email,
    avatarUrl: user?.avatar_url?.trim() || undefined,
  };
}

export function ctorCloud(
  raw: DTOs.MachineV1,
): KeysOnly<z.input<typeof cloud>> | undefined {
  const { provider, region } = raw;

  // Own servers have no provider; the schema treats a missing cloud as optional.
  if (!provider) return undefined;

  return {
    provider: normalizeCloudProvider(provider),
    region,
  };
}

function normalizeCloudProvider(provider: string) {
  const normalizedProvider = provider.toLowerCase().replace(/[\s_-]/g, '');

  if (
    normalizedProvider === 'aws' ||
    normalizedProvider === 'amazon' ||
    normalizedProvider === 'amazonwebservices'
  ) {
    return 'aws';
  }

  if (normalizedProvider === 'gcp' || normalizedProvider === 'googlecloud') {
    return 'googlecloud';
  }

  if (normalizedProvider === 'idcloudhost') {
    return 'idcloudhost';
  }

  if (
    normalizedProvider === 'biznetgio' ||
    normalizedProvider === 'biznetgioneolite' ||
    normalizedProvider === 'neolite'
  ) {
    return 'biznetgio';
  }

  if (normalizedProvider === 'do' || normalizedProvider === 'digitalocean') {
    return normalizedProvider;
  }

  if (
    normalizedProvider === 'alibabacloud' ||
    normalizedProvider === 'alicloud' ||
    normalizedProvider === 'aliyun'
  ) {
    return 'alibabacloud';
  }

  if (
    normalizedProvider === 'tencent' ||
    normalizedProvider === 'tencentcloud' ||
    normalizedProvider === 'qcloud'
  ) {
    return 'tencent';
  }

  return normalizedProvider;
}

export function ctorSpecs(
  _raw: DTOs.MachineV1,
): KeysOnlyDeep<z.input<typeof specs>> {
  return {
    cpu: {
      coreCount: 0,
      virtualCoreCount: 0,
    },
  };
}
