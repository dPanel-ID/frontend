import { describe, expect, it } from 'vitest';

import {
  cloudProviderRank,
  getCloudProviderLabel,
  normalizeCloudProviderKey,
} from './CloudProviderLogo';

describe('CloudProviderLogo helpers', () => {
  it('normalizes provider IDs from the API', () => {
    expect(normalizeCloudProviderKey('IDCloudHost')).toBe('idcloudhost');
    expect(normalizeCloudProviderKey('biznet-gio')).toBe('biznetgio');
    expect(normalizeCloudProviderKey(undefined)).toBe('');
  });

  it('labels known providers and leaves unknown ones undefined', () => {
    expect(getCloudProviderLabel('aws')).toBe('AWS');
    expect(getCloudProviderLabel('gcp')).toBe('Google Cloud');
    expect(getCloudProviderLabel('openstack')).toBeUndefined();
  });

  it('ranks preferred providers before others', () => {
    const ordered = [
      'biznetgio',
      'openstack',
      'aws',
      'IDCloudHost',
      'gcp',
    ].sort((a, b) => cloudProviderRank(a) - cloudProviderRank(b));
    expect(ordered).toEqual([
      'aws',
      'gcp',
      'IDCloudHost',
      'biznetgio',
      'openstack',
    ]);
  });
});
