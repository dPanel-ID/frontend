import { describe, expect, it } from 'vitest';

import {
  installedRedis,
  redisEnvEntries,
  suggestRedisPrefix,
} from './redis-env';

describe('installedRedis', () => {
  it('is null without an installed Redis', () => {
    expect(installedRedis(undefined)).toBeNull();
    expect(
      installedRedis([{ module_name: 'redis', status: 'failed' }]),
    ).toBeNull();
    expect(
      installedRedis([{ module_name: 'mariadb', status: 'installed' }]),
    ).toBeNull();
  });

  it('connects over 127.0.0.1 on the default port without a password', () => {
    expect(
      installedRedis([
        {
          module_name: 'Redis',
          status: 'installed',
          variables: { redis_bind_interface: '127.0.0.1', redis_port: 6379 },
        },
      ]),
    ).toEqual({ host: '127.0.0.1', port: 6379, password: 'none' });
    expect(
      installedRedis([{ module_name: 'redis', status: 'installed' }]),
    ).toEqual({ host: '127.0.0.1', port: 6379, password: 'none' });
  });

  it('reads the port and an empty password', () => {
    expect(
      installedRedis([
        {
          module_name: 'redis',
          status: 'installed',
          variables: { redis_port: '6380', redis_requirepass: '' },
        },
      ]),
    ).toEqual({ host: '127.0.0.1', port: 6380, password: 'none' });
  });

  it('cannot tell a hidden password on loopback', () => {
    expect(
      installedRedis([
        {
          module_name: 'redis',
          status: 'installed',
          variables: { redis_requirepass: '[redacted]' },
        },
      ])?.password,
    ).toBe('unknown');
  });

  it('needs a password when Redis listens beyond this server', () => {
    expect(
      installedRedis([
        {
          module_name: 'redis',
          status: 'installed',
          variables: {
            redis_bind_interface: '127.0.0.1 10.0.0.5',
            redis_requirepass: '[redacted]',
          },
        },
      ]),
    ).toEqual({ host: '127.0.0.1', port: 6379, password: 'required' });
    expect(
      installedRedis([
        {
          module_name: 'redis',
          status: 'installed',
          variables: { redis_bind_interface: '10.0.0.5' },
        },
      ]),
    ).toEqual({ host: '10.0.0.5', port: 6379, password: 'required' });
  });
});

describe('suggestRedisPrefix', () => {
  it('derives a prefix from the app name', () => {
    expect(suggestRedisPrefix('My Blog')).toBe('my_blog_');
    expect(suggestRedisPrefix('')).toBe('app_');
  });
});

describe('redisEnvEntries', () => {
  const server = { host: '127.0.0.1', port: 6379 };

  it('switches the chosen drivers and skips an empty password', () => {
    expect(
      redisEnvEntries({
        server,
        password: '',
        laravel: true,
        prefix: 'my_blog_',
        drivers: ['cache', 'queue', 'session'],
      }),
    ).toEqual([
      ['REDIS_HOST', '127.0.0.1'],
      ['REDIS_PORT', '6379'],
      ['REDIS_PREFIX', 'my_blog_'],
      ['CACHE_STORE', 'redis'],
      ['QUEUE_CONNECTION', 'redis'],
      ['SESSION_DRIVER', 'redis'],
    ]);
  });

  it('writes the password only when there is one', () => {
    const entries = redisEnvEntries({
      server,
      password: 'typed-by-the-user',
      laravel: true,
      prefix: 'shop_',
      drivers: ['cache'],
    });
    expect(entries).toContainEqual(['REDIS_PASSWORD', 'typed-by-the-user']);
    expect(entries.map(([key]) => key)).not.toContain('QUEUE_CONNECTION');
  });

  it('writes only the connection for an application that is not Laravel', () => {
    expect(
      redisEnvEntries({
        server,
        password: '',
        laravel: false,
        prefix: 'my_blog_',
        drivers: ['cache', 'queue', 'session'],
      }),
    ).toEqual([
      ['REDIS_HOST', '127.0.0.1'],
      ['REDIS_PORT', '6379'],
      ['REDIS_URL', 'redis://127.0.0.1:6379'],
    ]);
  });

  it('puts an encoded password into REDIS_URL', () => {
    const entries = redisEnvEntries({
      server: { host: '10.0.0.5', port: 6380 },
      password: 'p@ss/word',
      laravel: false,
      prefix: '',
      drivers: [],
    });
    expect(entries).toContainEqual(['REDIS_PASSWORD', 'p@ss/word']);
    expect(entries).toContainEqual([
      'REDIS_URL',
      'redis://:p%40ss%2Fword@10.0.0.5:6380',
    ]);
  });
});
