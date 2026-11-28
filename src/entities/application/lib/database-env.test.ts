import { describe, expect, it } from 'vitest';

import {
  DATABASE_ENGINES,
  databaseEnvEntries,
  existingDatabaseNames,
  existingEnvKeys,
  guessDatabaseEnvStyle,
  installedDatabaseEngines,
  installedDatabasePort,
  normalizeDatabasePrefix,
  suggestDatabaseName,
} from './database-env';
import { upsertEnvText } from './env-text';

const credentials = {
  engine: 'mariadb' as const,
  name: 'my_blog',
  user: 'my_blog',
  password: 'aB3-x_Y9',
};

describe('installedDatabaseEngines', () => {
  it('lists installed database servers, MariaDB first', () => {
    expect(
      installedDatabaseEngines([
        { module_name: 'mongodb', status: 'installed' },
        { module_name: 'postgresql', status: 'installed' },
        { module_name: 'redis', status: 'installed' },
        { module_name: 'MariaDB', status: 'installed' },
        { module_name: 'mariadb-database', status: 'installed' },
      ]),
    ).toEqual(['mariadb', 'postgresql', 'mongodb']);
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

  it('uses the generic DATABASE_URL while the framework is not identified', () => {
    expect(guessDatabaseEnvStyle('APP_ENV=production\nDB_HOST=x', null)).toBe(
      'url',
    );
    expect(guessDatabaseEnvStyle('', 'acme/laravel-shop', 'unknown')).toBe(
      'url',
    );
  });

  it('picks WordPress names for a site identified as WordPress', () => {
    expect(guessDatabaseEnvStyle('', 'acme/blog', 'wordpress')).toBe(
      'wordpress',
    );
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

describe('databaseEnvEntries with other engines and styles', () => {
  const mongo = { ...credentials, engine: 'mongodb' as const };

  it('connects MongoDB with a URL that signs in to its own database', () => {
    expect(databaseEnvEntries('url', mongo)).toEqual([
      [
        'DATABASE_URL',
        'mongodb://my_blog:aB3-x_Y9@127.0.0.1:27017/my_blog?authSource=my_blog',
      ],
    ]);
  });

  it('writes the Laravel MongoDB variables', () => {
    const url =
      'mongodb://my_blog:aB3-x_Y9@127.0.0.1:27018/my_blog?authSource=my_blog';
    expect(databaseEnvEntries('laravel', { ...mongo, port: 27018 })).toEqual([
      ['DB_CONNECTION', 'mongodb'],
      ['DB_URI', url],
      ['DB_DATABASE', 'my_blog'],
      ['MONGODB_URI', url],
    ]);
  });

  it('falls back to DATABASE_URL for a style the engine cannot use', () => {
    expect(
      databaseEnvEntries('wordpress', { ...credentials, engine: 'postgresql' }),
    ).toEqual([
      ['DATABASE_URL', 'postgresql://my_blog:aB3-x_Y9@127.0.0.1:5432/my_blog'],
    ]);
  });

  it('puts every variable behind a custom prefix', () => {
    expect(
      databaseEnvEntries('prefix', {
        ...credentials,
        engine: 'postgresql',
        port: 5433,
        prefix: 'analytics_',
      }),
    ).toEqual([
      [
        'ANALYTICS_DATABASE_URL',
        'postgresql://my_blog:aB3-x_Y9@127.0.0.1:5433/my_blog',
      ],
      ['ANALYTICS_DB_HOST', '127.0.0.1'],
      ['ANALYTICS_DB_PORT', '5433'],
      ['ANALYTICS_DB_DATABASE', 'my_blog'],
      ['ANALYTICS_DB_USERNAME', 'my_blog'],
      ['ANALYTICS_DB_PASSWORD', 'aB3-x_Y9'],
    ]);
  });
});

describe('normalizeDatabasePrefix', () => {
  it.each([
    ['analytics', 'ANALYTICS'],
    [' shop_2_ ', 'SHOP_2'],
    ['2shop', ''],
    ['a__b', ''],
    ['a-b', ''],
    ['', ''],
    ['A'.repeat(33), ''],
  ])('%s becomes %s', (input, expected) => {
    expect(normalizeDatabasePrefix(input)).toBe(expected);
  });
});

describe('installedDatabasePort', () => {
  it('reads the port the module was installed with', () => {
    const modules = [
      {
        module_name: 'mongodb',
        status: 'installed',
        variables: { mongodb_net_port: 27018 },
      },
      { module_name: 'postgresql', status: 'installed', variables: {} },
    ];
    expect(installedDatabasePort(modules, 'mongodb')).toBe(27018);
    expect(installedDatabasePort(modules, 'postgresql')).toBe(5432);
  });
});

describe('existingEnvKeys', () => {
  it('lists the keys the variables already set', () => {
    expect(
      existingEnvKeys('DB_HOST=x\n# DB_PORT=1\nAPP_ENV=production', [
        ['DB_HOST', '127.0.0.1'],
        ['DB_PORT', '3306'],
      ]),
    ).toEqual(['DB_HOST']);
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
