import { upsertEnvText } from '@/entities/application/lib/env-text';

import type { DTOs } from '@/shared/api';

/** Database servers an application can get its own database on. */
export type DatabaseEngine = 'mariadb' | 'postgresql';

/** The variable names a database's settings are written to. */
export type DatabaseEnvStyle = 'wordpress' | 'laravel' | 'url';

export const DATABASE_ENV_STYLES: DatabaseEnvStyle[] = [
  'wordpress',
  'laravel',
  'url',
];

interface EngineInfo {
  /** The child module that creates one database and its user. */
  childModule: string;
  port: number;
  /** Database and user names the child module accepts. */
  namePattern: RegExp;
  userPattern: RegExp;
  /** DATABASE_URL scheme and Laravel DB_CONNECTION driver. */
  scheme: string;
  driver: string;
}

/** Same rules as the mariadb-database and postgresql-database inputs. */
export const DATABASE_ENGINES: Record<DatabaseEngine, EngineInfo> = {
  mariadb: {
    childModule: 'mariadb-database',
    port: 3306,
    namePattern: /^[A-Za-z0-9_]{1,64}$/,
    userPattern: /^[A-Za-z0-9_]{1,32}$/,
    scheme: 'mysql',
    driver: 'mysql',
  },
  postgresql: {
    childModule: 'postgresql-database',
    port: 5432,
    namePattern: /^[a-z_][a-z0-9_]{0,62}$/,
    userPattern: /^[a-z_][a-z0-9_]{0,62}$/,
    scheme: 'postgresql',
    driver: 'pgsql',
  },
};

/** The application connects over the server's loopback address. */
export const DATABASE_HOST = '127.0.0.1';

/** Longest default name: the shortest user limit (MariaDB, 32). */
const SUGGESTED_NAME_MAX = 32;

type Installation = Pick<
  DTOs.ModuleInstallationV1,
  'module_name' | 'status' | 'installation_key' | 'variables'
>;

function isDatabaseEngine(name: string): name is DatabaseEngine {
  return name === 'mariadb' || name === 'postgresql';
}

/** Database servers installed on the server, MariaDB first. */
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
  return (['mariadb', 'postgresql'] as const).filter((engine) =>
    found.has(engine),
  );
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
 * it suits MariaDB and PostgreSQL alike. "My Blog" becomes "my_blog".
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
 * The variable names an application most likely reads: WordPress's own,
 * Laravel's DB_*, or one DATABASE_URL for anything else. They always go
 * into the runtime variables: release commands such as migrations run
 * with those, so the build needs none of them.
 */
export function guessDatabaseEnvStyle(
  runtimeEnvText: string,
  repository?: string | null,
  framework?: string | null,
): DatabaseEnvStyle {
  // A repository dPanel recognised as Laravel reads DB_*.
  if ((framework ?? '').toLowerCase() === 'laravel') return 'laravel';
  const repo = (repository ?? '').toLowerCase();
  if (/^\s*WORDPRESS_/m.test(runtimeEnvText) || repo.includes('wordpress')) {
    return 'wordpress';
  }
  if (/^\s*DB_/m.test(runtimeEnvText) || repo.includes('laravel')) {
    return 'laravel';
  }
  return 'url';
}

export interface DatabaseCredentials {
  engine: DatabaseEngine;
  name: string;
  user: string;
  password: string;
}

/** The variables that point an application at its new database. */
export function databaseEnvEntries(
  style: DatabaseEnvStyle,
  credentials: DatabaseCredentials,
): Array<[string, string]> {
  const { engine, name, user, password } = credentials;
  const { port, scheme, driver } = DATABASE_ENGINES[engine];
  switch (style) {
    case 'wordpress':
      return [
        ['WORDPRESS_DB_HOST', `${DATABASE_HOST}:${port}`],
        ['WORDPRESS_DB_NAME', name],
        ['WORDPRESS_DB_USER', user],
        ['WORDPRESS_DB_PASSWORD', password],
      ];
    case 'laravel':
      return [
        ['DB_CONNECTION', driver],
        ['DB_HOST', DATABASE_HOST],
        ['DB_PORT', String(port)],
        ['DB_DATABASE', name],
        ['DB_USERNAME', user],
        ['DB_PASSWORD', password],
      ];
    case 'url':
      // Generated passwords hold only URL-safe characters.
      return [
        [
          'DATABASE_URL',
          `${scheme}://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${DATABASE_HOST}:${port}/${encodeURIComponent(name)}`,
        ],
      ];
  }
}

/** Kept here for the helpers that import it from the database module. */
export { upsertEnvText };
