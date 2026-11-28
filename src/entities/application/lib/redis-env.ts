import type { DTOs } from '@/shared/api';

import { suggestDatabaseName } from './database-env';

/** The application runs on the same server as Redis. */
export const REDIS_LOOPBACK = '127.0.0.1';
export const REDIS_DEFAULT_PORT = 6379;

/** The Laravel drivers the helper can switch to Redis. */
export type RedisDriver = 'cache' | 'queue' | 'session';

export const REDIS_DRIVERS: RedisDriver[] = ['cache', 'queue', 'session'];

const DRIVER_KEYS: Record<RedisDriver, string> = {
  cache: 'CACHE_STORE',
  queue: 'QUEUE_CONNECTION',
  session: 'SESSION_DRIVER',
};

type Installation = Pick<
  DTOs.ModuleInstallationV1,
  'module_name' | 'status' | 'variables'
>;

/**
 * Whether Redis asks clients for a password:
 * - "none": installed without one;
 * - "required": it listens beyond this server, which needs a password;
 * - "unknown": dPanel hides the value, so it cannot tell. The person types
 *   it if they set one.
 * dPanel never stores or shows the password itself.
 */
export type RedisPasswordState = 'none' | 'required' | 'unknown';

/** What the helper needs from the Redis installed on the server. */
export interface RedisServerInfo {
  host: string;
  port: number;
  password: RedisPasswordState;
}

function stringOf(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

function bindAddresses(value: unknown) {
  return stringOf(value).split(/\s+/).filter(Boolean);
}

/** Values the API puts in place of a hidden one. */
function isHiddenValue(value: string) {
  return /^\[redacted\]$|^\*+$|^•+$/i.test(value);
}

function portOf(value: unknown) {
  const port = Number(stringOf(value));
  return Number.isInteger(port) && port > 0 && port <= 65535
    ? port
    : REDIS_DEFAULT_PORT;
}

/**
 * The installed Redis on the server, or null when there is none. The app
 * connects over 127.0.0.1 when Redis listens there (the default); when it
 * listens only on other addresses, the first of them.
 */
export function installedRedis(
  modules: Installation[] | undefined,
): RedisServerInfo | null {
  const redis = (modules ?? []).find(
    (module) =>
      (module.module_name || '').toLowerCase() === 'redis' &&
      module.status === 'installed',
  );
  if (!redis) return null;
  const variables = redis.variables ?? {};
  const binds = bindAddresses(variables.redis_bind_interface);
  const loopbackOnly =
    binds.length === 0 || binds.every((address) => address === REDIS_LOOPBACK);
  const host =
    binds.length === 0 || binds.includes(REDIS_LOOPBACK)
      ? REDIS_LOOPBACK
      : (binds[0] ?? REDIS_LOOPBACK);

  const hasPasswordKey = Object.prototype.hasOwnProperty.call(
    variables,
    'redis_requirepass',
  );
  const password = stringOf(variables.redis_requirepass);
  let state: RedisPasswordState;
  if (!loopbackOnly) state = 'required';
  else if (!hasPasswordKey || password === '') state = 'none';
  else if (isHiddenValue(password)) state = 'unknown';
  else state = 'required';

  return { host, port: portOf(variables.redis_port), password: state };
}

/**
 * A key prefix per application, so apps sharing one Redis never read
 * each other's cache: "My Blog" becomes "my_blog_".
 */
export function suggestRedisPrefix(appName: string): string {
  return `${suggestDatabaseName(appName)}_`;
}

export const REDIS_PREFIX_PATTERN = /^[A-Za-z0-9_:.-]{1,64}$/;

export interface RedisEnvOptions {
  server: Pick<RedisServerInfo, 'host' | 'port'>;
  /** Only written when not empty. */
  password: string;
  /**
   * Whether the application is identified as Laravel. Laravel gets its own
   * REDIS_PREFIX and driver variables; any other application gets the
   * connection only, as REDIS_HOST, REDIS_PORT and one REDIS_URL.
   */
  laravel: boolean;
  /** Laravel only. */
  prefix: string;
  /** Laravel only. */
  drivers: RedisDriver[];
}

/** redis://[:password@]host:port, the form most Redis clients read. */
export function redisURL(
  server: Pick<RedisServerInfo, 'host' | 'port'>,
  password: string,
): string {
  const auth = password ? `:${encodeURIComponent(password)}@` : '';
  return `redis://${auth}${server.host}:${server.port}`;
}

/**
 * The runtime variables that connect an app to Redis and, for Laravel,
 * switch the chosen drivers to it. A password is written only when there
 * is one; like every variable it is masked once saved.
 */
export function redisEnvEntries(
  options: RedisEnvOptions,
): Array<[string, string]> {
  const entries: Array<[string, string]> = [
    ['REDIS_HOST', options.server.host],
    ['REDIS_PORT', String(options.server.port)],
  ];
  if (options.password) entries.push(['REDIS_PASSWORD', options.password]);
  if (!options.laravel) {
    entries.push(['REDIS_URL', redisURL(options.server, options.password)]);
    return entries;
  }
  entries.push(['REDIS_PREFIX', options.prefix.trim()]);
  for (const driver of REDIS_DRIVERS) {
    if (options.drivers.includes(driver)) {
      entries.push([DRIVER_KEYS[driver], 'redis']);
    }
  }
  return entries;
}
