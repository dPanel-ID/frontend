import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { childModuleIds, indexCatalogModules } from './catalog-index';

describe('indexCatalogModules', () => {
  it('indexes category, icon and name by module ID', () => {
    const index = indexCatalogModules([
      {
        id: 'apisix',
        name: 'Apache APISIX',
        category: 'infrastructure',
        icon_url: '/v1/modules/apisix/icon',
      },
      { id: 'firewall', name: ' Firewall ', category: ' security ' },
    ] as DTOs.ModuleCatalogItemV1[]);

    expect(index.get('apisix')).toEqual({
      category: 'infrastructure',
      iconUrl: '/v1/modules/apisix/icon',
      name: 'Apache APISIX',
    });
    expect(index.get('firewall')?.category).toBe('security');
    expect(index.get('firewall')?.iconUrl).toBeUndefined();
  });

  it('is empty without a catalog', () => {
    expect(indexCatalogModules(undefined).size).toBe(0);
  });
});

describe('childModuleIds', () => {
  it('collects modules nested under a parent', () => {
    const index = indexCatalogModules([
      {
        id: 'mariadb',
        name: 'MariaDB',
        supported: true,
        children: [
          {
            id: 'mariadb-database',
            name: 'MariaDB Database',
            supported: true,
            parent: 'mariadb',
          },
        ],
      },
      { id: 'php', name: 'PHP', supported: true },
    ]);
    expect([...childModuleIds(index)]).toEqual(['mariadb-database']);
    expect(index.get('mariadb-database')?.parent).toBe('mariadb');
  });
});
