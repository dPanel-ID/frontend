import { describe, expect, it } from 'vitest';

import {
  orphanDeletePhase,
  supportsOrphanScan,
  toOrphanVmRows,
} from './orphan-vms';

describe('supportsOrphanScan', () => {
  it.each([
    'aws',
    'gcp',
    'digitalocean',
    'IDCloudHost',
    'idcloudhost',
    'tencent',
    'Tencent Cloud',
  ])('supports %s', (provider) => {
    expect(supportsOrphanScan(provider)).toBe(true);
  });

  it.each(['biznetgio', 'alibabacloud', 'proxmox', '', null, undefined])(
    'does not support %s',
    (provider) => {
      expect(supportsOrphanScan(provider)).toBe(false);
    },
  );
});

describe('toOrphanVmRows', () => {
  it('uses the zone of a GCP VM to delete it', () => {
    const [row] = toOrphanVmRows('gcp', [
      {
        id: '123',
        name: 'web-1',
        region: 'asia-southeast2',
        zone: 'asia-southeast2-a',
        state: 'RUNNING',
        evidence: 'tagged',
        server_id: '88',
      },
    ]);
    expect(row).toMatchObject({
      instanceId: '123',
      label: 'web-1',
      confirmText: 'web-1',
      deleteRegion: 'asia-southeast2-a',
      location: 'asia-southeast2-a',
      serverId: '88',
    });
  });

  it('uses the region elsewhere and the ID when there is no name', () => {
    const [row] = toOrphanVmRows('aws', [
      { id: 'i-0abc', name: '', region: 'us-east-1', zone: 'us-east-1a' },
    ]);
    expect(row).toMatchObject({
      label: 'i-0abc',
      confirmText: 'i-0abc',
      deleteRegion: 'us-east-1',
    });
  });

  it('drops VMs without an ID and survives null items', () => {
    expect(toOrphanVmRows('aws', [{ name: 'ghost' }])).toEqual([]);
    expect(toOrphanVmRows('aws', null)).toEqual([]);
  });
});

describe('orphanDeletePhase', () => {
  it.each([
    ['queued', 'running'],
    ['running', 'running'],
    ['', 'running'],
    [undefined, 'running'],
    ['succeeded', 'succeeded'],
    ['FAILED', 'failed'],
  ] as const)('%s is %s', (status, phase) => {
    expect(orphanDeletePhase(status)).toBe(phase);
  });
});
