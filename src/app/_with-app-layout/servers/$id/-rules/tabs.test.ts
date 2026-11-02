import { describe, expect, it } from 'vitest';

import { schemaServerDetailSearch } from './tabs';

describe('schemaServerDetailSearch', () => {
  it('keeps a known network view so the firewall can be deep-linked', () => {
    expect(
      schemaServerDetailSearch.parse({ tab: 'network', view: 'firewall' }),
    ).toEqual({ tab: 'network', view: 'firewall' });
  });

  it('drops an unknown view and defaults a missing tab', () => {
    expect(schemaServerDetailSearch.parse({ view: 'nope' })).toEqual({
      tab: 'overview',
      view: undefined,
    });
    expect(
      schemaServerDetailSearch.parse({ tab: 'network' }).view,
    ).toBeUndefined();
  });
});
