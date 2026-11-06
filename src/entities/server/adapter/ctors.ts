import type z from 'zod';

import { personOf } from '@/entities/user/lib/person';

import type { DTOs } from '@/shared/api';
import type { KeysOnly, KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { cloud, creator, specs } from '../rules/schema/parts';

/** The creator as the API resolves them from the server's owner subject. */
export function ctorCreator(
  raw: DTOs.MachineV1,
): KeysOnly<z.input<typeof creator>> | undefined {
  const person = personOf(raw.user);

  if (!person) return undefined;

  return {
    name: person.name,
    username: person.username,
    avatarUrl: person.avatarUrl,
  };
}

export function ctorCloud(
  raw: DTOs.MachineV1,
): KeysOnly<z.input<typeof cloud>> | undefined {
  const { provider, region } = raw;

  // A private server is the user's own machine, never a cloud VM.
  if (raw.connectivity === 'private') return undefined;

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

/**
 * Where the server is. A private server shows its own LAN address; its
 * public address is the IP its agent connects to dPanel from, when that IP
 * is public (a load balancer's DNS record points there).
 */
export function ctorHost(raw: DTOs.MachineV1) {
  const isPrivate = raw.connectivity === 'private';

  return {
    address: isPrivate ? (raw.lan_address ?? '') : (raw.address ?? raw.domain),
    publicAddress: isPrivate ? raw.address || undefined : undefined,
    name: raw.hostname,
    private: isPrivate,
  };
}
