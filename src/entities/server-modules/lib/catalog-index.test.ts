import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { indexCatalogModules } from './catalog-index';

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
