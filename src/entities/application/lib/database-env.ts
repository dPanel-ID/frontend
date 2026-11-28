import type { DTOs } from '@/shared/api';

import { knownFramework } from './app-framework';
import { parseEnvText } from './env-text';

/** Database servers an application can get its own database on. */
export type DatabaseEngine = 'mariadb' | 'postgresql' | 'mongodb';

/**
 * The variable names a database's settings are written to: WordPress's
 * own, Laravel's DB_*, one DATABASE_URL, or DATABASE_URL and DB_* behind a
 * custom prefix (ANALYTICS_DATABASE_URL), so one application can use
 * several databases without one overwriting another.
 */
export type DatabaseEnvStyle = 'wordpress' | 'laravel' | 'url' | 'prefix';

export const DATABASE_ENV_STYLES: DatabaseEnvStyle[] = [
  'url',
  'laravel',
  'wordpress',
  'prefix',
];

interface EngineInfo {
  label: string;
  /** The child module that creates one database and its user. */
  childModule: string;
  /** Default port, and the server module input that may change it. */
  port: number;
  portVariable: string;
  /** Database and user names the child module accepts. */
  namePattern: RegExp;
  userPattern: RegExp;
  /** DATABASE_URL scheme and Laravel DB_CONNECTION driver. */
  scheme: string;
  driver: string;
  /** Variable styles the engine can be written as. */
  styles: DatabaseEnvStyle[];
  /**
   * The child module signs in with the database's administrator password,
   * which dPanel does not keep: the person types it.
   */
  needsAdminPassword: boolean;
}

/** Same rules as the mariadb-, postgresql- and mongodb-database inputs. */
export const DATABASE_ENGINES: Record<DatabaseEngine, EngineInfo> = {
  mariadb: {
    label: 'MariaDB',
    childModule: 'mariadb-database',
    port: 3306,
    portVariable: 'mariadb_port',
    namePattern: /^[A-Za-z0-9_]{1,64}$/,
    userPattern: /^[A-Za-z0-9_]{1,32}$/,
    scheme: 'mysql',
    driver: 'mysql',
    styles: ['url', 'laravel', 'wordpress', 'prefix'],
    needsAdminPassword: false,
  },
  postgresql: {
    label: 'PostgreSQL',
    childModule: 'postgresql-database',
    port: 5432,
    portVariable: 'postgresql_port',
    namePattern: /^[a-z_][a-z0-9_]{0,62}$/,
    userPattern: /^[a-z_][a-z0-9_]{0,62}$/,
    scheme: 'postgresql',
    driver: 'pgsql',
    styles: ['url', 'laravel', 'prefix'],
    needsAdminPassword: false,
  },
  mongodb: {
    label: 'MongoDB',
    childModule: 'mongodb-database',
    port: 27017,
    portVariable: 'mongodb_net_port',
    namePattern: /^[A-Za-z0-9_]{1,63}$/,
    userPattern: /^[A-Za-z0-9_]{1,64}$/,
    scheme: 'mongodb',
    driver: 'mongodb',
    styles: ['url', 'laravel', 'prefix'],
    needsAdminPassword: true,
  },
};

const ENGINE_ORDER: DatabaseEngine[] = ['mariadb', 'postgresql', 'mongodb'];

/** The application connects over the server's loopback address. */
export const DATABASE_HOST = '127.0.0.1';

/** Longest default name: the shortest user limit (MariaDB, 32). */
const SUGGESTED_NAME_MAX = 32;

/**
 * A custom prefix: an uppercase letter, then uppercase letters, digits and
 * single underscores, at most 32 characters (ANALYTICS, SHOP_2).
 */
export const DATABASE_PREFIX_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;
export const DATABASE_PREFIX_MAX = 32;

type Installation = Pick<
  DTOs.ModuleInstallationV1,
  'module_name' | 'status' | 'installation_key' | 'variables'
>;

function isDatabaseEngine(name: string): name is DatabaseEngine {
  return name === 'mariadb' || name === 'postgresql' || name === 'mongodb';
}

/** Database servers installed on the server: MariaDB, PostgreSQL, MongoDB. */
export function installedDatabaseEngines(
  modules: Installation[] | undefined,
): DatabaseEngine[] {
  const found = new Set<DatabaseEngine>();
  for (const module of modules ?? []) {
    const name = (module.module_name || '').toLowerCase();
    if (isDatabaseEngine(name) && module.status === 'installed') {
      found.add(name);
    }
  }
  return ENGINE_ORDER.filter((engine) => found.has(engine));
}

/** The port the installed engine listens on, or its default. */
export function installedDatabasePort(
  modules: Installation[] | undefined,
  engine: DatabaseEngine,
): number {
  const { port, portVariable } = DATABASE_ENGINES[engine];
  const module = (modules ?? []).find(
    (item) =>
      (item.module_name || '').toLowerCase() === engine &&
      item.status === 'installed',
  );
  const value = Number(module?.variables?.[portVariable]);
  return Number.isInteger(value) && value > 0 && value <= 65535 ? value : port;
}

/** Names of the databases already created on engine on the server. */
export function existingDatabaseNames(
  modules: Installation[] | undefined,
  engine: DatabaseEngine,
): Set<string> {
  const child = DATABASE_ENGINES[engine].childModule;
  const names = new Set<string>();
  for (const module of modules ?? []) {
    if ((module.module_name || '').toLowerCase() !== child) continue;
    const key = module.installation_key ?? '';
    const at = key.indexOf('@');
    if (at >= 0) names.add(key.slice(at + 1));
    const variable = module.variables?.database_name;
    if (typeof variable === 'string' && variable) names.add(variable);
  }
  return names;
}

/**
 * A database (and user) name from the application name: lowercase letters,
 * digits and underscores, starting with a letter, at most 32 characters, so
 * it suits every engine. "My Blog" becomes "my_blog".
 */
export function suggestDatabaseName(appName: string): string {
  let name = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!name) return 'app';
  if (!/^[a-z]/.test(name)) name = `app_${name}`;
  return name.slice(0, SUGGESTED_NAME_MAX).replace(/_+$/, '');
}

/**
 * The variable names the application most likely reads, from its
 * framework: Laravel's DB_*, WordPress's own, otherwise one DATABASE_URL.
 * A WordPress site is also recognised by its repository name or existing
 * WORDPRESS_* variables. They always go into the runtime variables: release
 * commands such as migrations run with those, so the build needs none.
 */
export function guessDatabaseEnvStyle(
  runtimeEnvText: string,
  repository?: string | null,
  framework?: string | null,
): DatabaseEnvStyle {
  const known = knownFramework(framework);
  if (known === 'laravel') return 'laravel';
  if (known === 'wordpress') return 'wordpress';
  const repo = (repository ?? '').toLowerCase();
  if (/^\s*WORDPRESS_/m.test(runtimeEnvText) || repo.includes('wordpress')) {
    return 'wordpress';
  }
  return 'url';
}

/** The style to use for engine: the chosen one when the engine has it. */
export function styleForEngine(
  engine: DatabaseEngine,
  style: DatabaseEnvStyle,
): DatabaseEnvStyle {
  return DATABASE_ENGINES[engine].styles.includes(style) ? style : 'url';
}

/**
 * The prefix as written: uppercase, without surrounding underscores, or an
 * empty string when it is not a valid prefix.
 */
export function normalizeDatabasePrefix(prefix: string): string {
  const value = prefix
    .trim()
    .toUpperCase()
    .replace(/^_+|_+$/g, '');
  return value.length <= DATABASE_PREFIX_MAX &&
    DATABASE_PREFIX_PATTERN.test(value)
    ? value
    : '';
}

export interface DatabaseCredentials {
  engine: DatabaseEngine;
  name: string;
  user: string;
  password: string;
  /** The engine's port on the server; the engine's default when unset. */
  port?: number;
  /** For the prefix style: a prefix normalizeDatabasePrefix accepts. */
  prefix?: string;
}

function connectionURL(credentials: DatabaseCredentials, port: number) {
  const { engine, name, user, password } = credentials;
  const { scheme } = DATABASE_ENGINES[engine];
  // MongoDB users live in their own database, which signs them in.
  const query =
    engine === 'mongodb' ? `?authSource=${encodeURIComponent(name)}` : '';
  // Generated passwords hold only URL-safe characters.
  return `${scheme}://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${DATABASE_HOST}:${port}/${encodeURIComponent(name)}${query}`;
}

/** The variables that point an application at its new database. */
export function databaseEnvEntries(
  requested: DatabaseEnvStyle,
  credentials: DatabaseCredentials,
): Array<[string, string]> {
  const { engine, name, user, password } = credentials;
  const { driver } = DATABASE_ENGINES[engine];
  const port = credentials.port ?? DATABASE_ENGINES[engine].port;
  const url = connectionURL(credentials, port);
  const style = styleForEngine(engine, requested);
  switch (style) {
    case 'wordpress':
      return [
        ['WORDPRESS_DB_HOST', `${DATABASE_HOST}:${port}`],
        ['WORDPRESS_DB_NAME', name],
        ['WORDPRESS_DB_USER', user],
        ['WORDPRESS_DB_PASSWORD', password],
      ];
    case 'laravel':
      if (engine === 'mongodb') {
        // The MongoDB driver for Laravel reads a connection string.
        return [
          ['DB_CONNECTION', driver],
          ['DB_URI', url],
          ['DB_DATABASE', name],
          ['MONGODB_URI', url],
        ];
      }
      return [
        ['DB_CONNECTION', driver],
        ['DB_HOST', DATABASE_HOST],
        ['DB_PORT', String(port)],
        ['DB_DATABASE', name],
        ['DB_USERNAME', user],
        ['DB_PASSWORD', password],
      ];
    case 'prefix': {
      const prefix = normalizeDatabasePrefix(credentials.prefix ?? '');
      if (!prefix) return [['DATABASE_URL', url]];
      return [
        [`${prefix}_DATABASE_URL`, url],
        [`${prefix}_DB_HOST`, DATABASE_HOST],
        [`${prefix}_DB_PORT`, String(port)],
        [`${prefix}_DB_DATABASE`, name],
        [`${prefix}_DB_USERNAME`, user],
        [`${prefix}_DB_PASSWORD`, password],
      ];
    }
    case 'url':
      return [['DATABASE_URL', url]];
  }
}

/** The keys of entries that env text already sets. */
export function existingEnvKeys(
  envText: string,
  entries: Array<[string, string]>,
): string[] {
  const present = new Set(
    parseEnvText(envText).variables.map((variable) => variable.key),
  );
  return entries.map(([key]) => key).filter((key) => present.has(key));
}
