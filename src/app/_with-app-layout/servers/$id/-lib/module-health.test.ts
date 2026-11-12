import { describe, expect, it } from 'vitest';

import { indexModuleHealth, servicesNeedingAttention } from './module-health';

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
