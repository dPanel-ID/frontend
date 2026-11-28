import { describe, expect, it } from 'vitest';

import { createdApplicationRoute } from './created-app-route';

describe('createdApplicationRoute', () => {
  it("opens the new application's page", () => {
    expect(createdApplicationRoute(130)).toEqual({
      to: '/applications/$id',
      params: { id: '130' },
      replace: true,
    });
  });

  it('falls back to the list without an ID', () => {
    expect(createdApplicationRoute(undefined)).toEqual({
      to: '/applications',
      replace: true,
    });
    expect(createdApplicationRoute(0)).toEqual({
      to: '/applications',
      replace: true,
    });
  });
});
