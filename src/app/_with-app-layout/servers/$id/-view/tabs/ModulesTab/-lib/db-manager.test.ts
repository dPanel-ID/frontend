import { describe, expect, it } from 'vitest';

import { dbManagerUrl, firstDbManagerUrl } from './db-manager';

const host = 'https://dbmanager.devetek.app/';
const install = (
  module_name: string,
  status = 'installed',
  id = 'iacmod_1',
) => ({
  id,
  module_name,
  status,
});

describe('dbManagerUrl', () => {
  it('links installed MariaDB and PostgreSQL to the server and installation', () => {
    expect(dbManagerUrl(host, '138', install('mariadb'))).toBe(
      'https://dbmanager.devetek.app/?server=138&service=iacmod_1',
    );
    expect(
      dbManagerUrl(host, '7', install('PostgreSQL', 'installed', 'pg')),
    ).toBe('https://dbmanager.devetek.app/?server=7&service=pg');
  });

  it('hides the link for other modules and unfinished installs', () => {
    expect(dbManagerUrl(host, '138', install('redis'))).toBeNull();
    expect(
      dbManagerUrl(host, '138', install('mariadb', 'installing')),
    ).toBeNull();
    expect(dbManagerUrl(host, '138', install('mariadb', 'failed'))).toBeNull();
  });

  it('hides the link when db-manager is not configured', () => {
    expect(dbManagerUrl(undefined, '138', install('mariadb'))).toBeNull();
    expect(dbManagerUrl('  ', '138', install('mariadb'))).toBeNull();
    expect(dbManagerUrl('not a url', '138', install('mariadb'))).toBeNull();
    expect(
      dbManagerUrl('javascript:alert(1)', '138', install('mariadb')),
    ).toBeNull();
    expect(dbManagerUrl(host, '', install('mariadb'))).toBeNull();
  });

  it('encodes identifiers', () => {
    expect(
      dbManagerUrl(host, '1 2', install('mariadb', 'installed', 'a&b')),
    ).toBe('https://dbmanager.devetek.app/?server=1+2&service=a%26b');
  });
});

describe('firstDbManagerUrl', () => {
  it('picks the first installation that can be opened', () => {
    expect(
      firstDbManagerUrl(host, '138', [
        install('mariadb', 'installing', 'old'),
        install('mariadb', 'installed', 'new'),
      ]),
    ).toBe('https://dbmanager.devetek.app/?server=138&service=new');
    expect(firstDbManagerUrl(host, '138', [install('redis')])).toBeNull();
  });
});
