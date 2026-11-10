import { describe, expect, it } from 'vitest';

import { canOfferModuleAdoption, isAdoptedModule } from './adopt';

describe('canOfferModuleAdoption', () => {
  it('offers adoption when MariaDB has no record', () => {
    expect(canOfferModuleAdoption([])).toBe(true);
    expect(
      canOfferModuleAdoption([{ module_name: 'php', name: 'php' }]),
    ).toBe(true);
  });

  it('does not offer adoption once MariaDB has a record', () => {
    expect(
      canOfferModuleAdoption([{ module_name: 'mariadb', name: 'mariadb' }]),
    ).toBe(false);
    expect(
      canOfferModuleAdoption([{ module_name: 'MariaDB', name: 'MariaDB' }]),
    ).toBe(false);
  });

  it('treats a database created on MariaDB as a different module', () => {
    expect(
      canOfferModuleAdoption([
        { module_name: 'mariadb-database', name: 'mariadb-database' },
      ]),
    ).toBe(true);
  });
});

describe('isAdoptedModule', () => {
  it('recognises only adopted records', () => {
    expect(isAdoptedModule({ source: 'adopted' })).toBe(true);
    expect(isAdoptedModule({ source: 'agent' })).toBe(false);
    expect(isAdoptedModule({})).toBe(false);
  });
});
