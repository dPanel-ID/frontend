import { describe, expect, it } from 'vitest';

import { isMigrateOwnershipVisible } from './config';

describe('isMigrateOwnershipVisible', () => {
  it('keeps Migrate Ownership hidden: workspace resources stay put', () => {
    expect(isMigrateOwnershipVisible()).toBe(false);
  });
});
