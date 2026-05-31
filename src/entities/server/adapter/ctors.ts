import type z from 'zod';

import type { DTOs } from '@/shared/api';
import type { KeysOnly, KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { cloud, specs } from '../rules/schema/parts';

export function ctorCloud(
  raw: DTOs.MachineV1,
): KeysOnly<z.input<typeof cloud>> | null {
  const { provider, region } = raw;

  if (!provider) return null;

  return {
    provider: normalizeCloudProvider(provider),
    region,
  };
}

function normalizeCloudProvider(provider: string) {
  const normalizedProvider = provider.toLowerCase().replace(/[\s_-]/g, '');

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
