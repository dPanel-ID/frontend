import { describe, expect, it } from 'vitest';

import {
  DATABASE_ENGINES,
  databaseEnvEntries,
  existingDatabaseNames,
  guessDatabaseEnvStyle,
  installedDatabaseEngines,
  suggestDatabaseName,
  upsertEnvText,
} from './database-env';

const credentials = {
  engine: 'mariadb' as const,
  name: 'my_blog',
  user: 'my_blog',
  password: 'aB3-x_Y9',
};

describe('installedDatabaseEngines', () => {
  it('lists installed MariaDB and PostgreSQL only, MariaDB first', () => {
    expect(
      installedDatabaseEngines([
        { module_name: 'postgresql', status: 'installed' },
        { module_name: 'redis', status: 'installed' },
        { module_name: 'MariaDB', status: 'installed' },
        { module_name: 'mariadb-database', status: 'installed' },
      ]),
    ).toEqual(['mariadb', 'postgresql']);
  });

  it('skips a database server that is not installed yet', () => {
    expect(
      installedDatabaseEngines([{ module_name: 'mariadb', status: 'failed' }]),
    ).toEqual([]);
    expect(installedDatabaseEngines(undefined)).toEqual([]);
  });
});

describe('existingDatabaseNames', () => {
  it('reads names from the instance key and the variables', () => {
    const names = existingDatabaseNames(
      [
        {
          module_name: 'mariadb-database',
          status: 'installed',
          installation_key: 'mariadb-database@shop',
        },
        {
          module_name: 'mariadb-database',
          status: 'installed',
          variables: { database_name: 'blog' },
        },
        {
          module_name: 'postgresql-database',
          status: 'installed',
          installation_key: 'postgresql-database@other',
        },
      ],
      'mariadb',
    );
    expect([...names].sort()).toEqual(['blog', 'shop']);
  });
});

describe('suggestDatabaseName', () => {
  it.each([
    ['My Blog', 'my_blog'],
    ['WordPress', 'wordpress'],
    ['  shop--2026 ', 'shop_2026'],
    ['2026 site', 'app_2026_site'],
    ['!!!', 'app'],
    ['a'.repeat(40), 'a'.repeat(32)],
  ])('%s becomes %s', (appName, expected) => {
    const name = suggestDatabaseName(appName);
    expect(name).toBe(expected);
    for (const engine of Object.values(DATABASE_ENGINES)) {
      expect(name).toMatch(engine.namePattern);
      expect(name).toMatch(engine.userPattern);
    }
  });
});

describe('guessDatabaseEnvStyle', () => {
  it('picks WordPress names for a WordPress repository or variables', () => {
    expect(guessDatabaseEnvStyle('', 'dPanel-ID/wordpress-example')).toBe(
      'wordpress',
    );
    expect(guessDatabaseEnvStyle('WORDPRESS_HOME=https://a.b', null)).toBe(
      'wordpress',
    );
  });

  it('picks Laravel names for DB_ variables or a Laravel repository', () => {
    expect(guessDatabaseEnvStyle('APP_ENV=production\nDB_HOST=x', null)).toBe(
      'laravel',
    );
    expect(guessDatabaseEnvStyle('', 'acme/laravel-shop')).toBe('laravel');
  });

  it('picks Laravel names for a repository dPanel recognised as Laravel', () => {
    expect(guessDatabaseEnvStyle('PORT=3000', 'acme/shop', 'laravel')).toBe(
      'laravel',
    );
  });

  it('falls back to DATABASE_URL', () => {
    expect(guessDatabaseEnvStyle('PORT=3000', 'acme/api')).toBe('url');
  });
});

describe('databaseEnvEntries', () => {
  it('writes the WordPress variables', () => {
    expect(databaseEnvEntries('wordpress', credentials)).toEqual([
      ['WORDPRESS_DB_HOST', '127.0.0.1:3306'],
      ['WORDPRESS_DB_NAME', 'my_blog'],
      ['WORDPRESS_DB_USER', 'my_blog'],
      ['WORDPRESS_DB_PASSWORD', 'aB3-x_Y9'],
    ]);
  });

  it('writes the Laravel variables with the engine driver and port', () => {
    expect(
      databaseEnvEntries('laravel', { ...credentials, engine: 'postgresql' }),
    ).toEqual([
      ['DB_CONNECTION', 'pgsql'],
      ['DB_HOST', '127.0.0.1'],
      ['DB_PORT', '5432'],
      ['DB_DATABASE', 'my_blog'],
      ['DB_USERNAME', 'my_blog'],
      ['DB_PASSWORD', 'aB3-x_Y9'],
    ]);
  });

  it('writes one DATABASE_URL', () => {
    expect(databaseEnvEntries('url', credentials)).toEqual([
      ['DATABASE_URL', 'mysql://my_blog:aB3-x_Y9@127.0.0.1:3306/my_blog'],
    ]);
  });
});

describe('upsertEnvText', () => {
  it('replaces keys where they stand and appends new ones', () => {
    const text = [
      '# database',
      'WORDPRESS_DB_HOST=localhost',
      'export WORDPRESS_DB_PASSWORD=root',
      'WORDPRESS_HOME=https://blog.example.com',
      '',
    ].join('\n');
    expect(
      upsertEnvText(text, [
        ['WORDPRESS_DB_HOST', '127.0.0.1:3306'],
        ['WORDPRESS_DB_NAME', 'blog'],
        ['WORDPRESS_DB_PASSWORD', 'secret'],
      ]),
    ).toBe(
      [
        '# database',
        'WORDPRESS_DB_HOST=127.0.0.1:3306',
        'WORDPRESS_DB_PASSWORD=secret',
        'WORDPRESS_HOME=https://blog.example.com',
        'WORDPRESS_DB_NAME=blog',
      ].join('\n'),
    );
  });

  it('fills empty text', () => {
    expect(upsertEnvText('', [['A', '1']])).toBe('A=1');
  });

  it('does not touch a key that only starts the same way', () => {
    expect(upsertEnvText('DB_HOST_EXTRA=1', [['DB_HOST', '2']])).toBe(
      'DB_HOST_EXTRA=1\nDB_HOST=2',
    );
  });
});
