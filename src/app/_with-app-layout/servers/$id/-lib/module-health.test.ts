import { describe, expect, it } from 'vitest';

import {
  indexModuleHealth,
  installedVersion,
  servicesNeedingAttention,
  versionMismatch,
} from './module-health';

describe('servicesNeedingAttention', () => {
  const health = indexModuleHealth([
    {
      installation_id: 'mi_caddy',
      module_name: 'caddyserver',
      needs_attention: true,
      services: [
        { unit: 'dpanel-router.service', state: 'failed' },
        { unit: 'other.service', state: 'running' },
      ],
    },
    {
      installation_id: 'mi_redis',
      module_name: 'redis',
      needs_attention: false,
      services: [{ unit: 'redis-server.service', state: 'running' }],
    },
  ]);

  it('lists only the units that are not running', () => {
    expect(servicesNeedingAttention(health, 'mi_caddy')).toEqual([
      { unit: 'dpanel-router.service', state: 'failed' },
    ]);
  });

  it('is empty for a healthy or unknown module', () => {
    expect(servicesNeedingAttention(health, 'mi_redis')).toEqual([]);
    expect(servicesNeedingAttention(health, 'mi_unknown')).toEqual([]);
  });
});

describe('installedVersion and versionMismatch', () => {
  const health = indexModuleHealth([
    {
      installation_id: 'mi_old',
      module_name: 'mariadb',
      needs_attention: false,
      services: [],
      version: {
        package: 'mariadb-server',
        installed: '10.11.14',
        chosen: '12.3',
        mismatch: true,
      },
    },
    {
      installation_id: 'mi_new',
      module_name: 'mariadb',
      needs_attention: false,
      services: [],
      version: {
        package: 'mariadb-server',
        installed: '12.3.3',
        chosen: '12.3',
        mismatch: false,
      },
    },
    {
      installation_id: 'mi_gone',
      module_name: 'mariadb',
      needs_attention: false,
      services: [],
      version: { package: 'mariadb-server', mismatch: false, missing: true },
    },
  ]);

  it('reports the release that really runs', () => {
    expect(installedVersion(health, 'mi_new')?.installed).toBe('12.3.3');
    expect(installedVersion(health, 'mi_gone')).toBeUndefined();
    expect(installedVersion(health, 'mi_unknown')).toBeUndefined();
  });

  it('flags only a server that runs another release', () => {
    expect(versionMismatch(health, 'mi_old')?.installed).toBe('10.11.14');
    expect(versionMismatch(health, 'mi_new')).toBeUndefined();
  });
});
