import type { DTOs } from '@/shared/api';

import { resolveServerModuleLogo } from '../config/registry';
import { getModuleInfoByFind } from '../model/getModuleInfo';

export const DATABASE_MODULE_IDS = new Set([
  'mariadb',
  'mongodb',
  'mysql',
  'postgresql',
  'redis',
]);

/**
 * Modules that each record one database created on a database server, as
 * opposed to the server engines above.
 */
export const CREATED_DATABASE_MODULE_IDS = new Set([
  'mariadb-database',
  'postgresql-database',
]);

/** One module with every installation of it on a server. */
export type OverviewModuleGroup = {
  id: string;
  name: string;
  logoUrl: string;
  installations: DTOs.ModuleInstallationV1[];
};

/** Groups installations by module so "PHP 8.3, 8.4" is one chip. */
export function groupModules(modules: DTOs.ModuleInstallationV1[]) {
  const groups = new Map<string, OverviewModuleGroup>();

  for (const module of modules) {
    const moduleName = module.module_name || module.name;
    if (!moduleName) continue;

    const existing = groups.get(moduleName);
    if (existing) {
      existing.installations.push(module);
      continue;
    }

    groups.set(moduleName, {
      id: moduleName,
      name: moduleDisplayName(module),
      logoUrl: resolveServerModuleLogo({ id: moduleName }),
      installations: [module],
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      installations: group.installations.sort((left, right) =>
        moduleInstanceLabel(left).localeCompare(moduleInstanceLabel(right)),
      ),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function moduleDisplayName(module: DTOs.ModuleInstallationV1) {
  return (
    getModuleInfoByFind({ id: module.module_name })?.name ||
    module.display_name ||
    module.name ||
    module.module_name
  );
}

function moduleVersion(module?: DTOs.ModuleInstallationV1) {
  if (!module) return '';

  const variables = module.variables ?? {};
  const directKeys = [
    `${module.module_name}_version`,
    module.module_name === 'go' ? 'golang_version' : '',
    module.module_name === 'nodejs' ? 'nodejs_version' : '',
    module.module_name === 'python' ? 'python_version' : '',
    module.module_name === 'ruby' ? 'ruby_version' : '',
    module.module_name === 'bun' ? 'bun_version' : '',
    module.module_name === 'php' ? 'php_version' : '',
    module.module_name === 'postgresql' ? 'postgresql_version' : '',
    module.module_name === 'mariadb' ? 'mariadb_use_official_repo_version' : '',
  ].filter(Boolean);

  for (const key of directKeys) {
    const value = variables[key];
    if (value != null && String(value).trim() !== '') return String(value);
  }

  for (const [key, value] of Object.entries(variables)) {
    if (key.endsWith('_version') && value != null && String(value).trim()) {
      return String(value);
    }
  }

  return '';
}

/** The version, installation key or status that tells one install apart. */
export function moduleInstanceLabel(module?: DTOs.ModuleInstallationV1) {
  if (!module) return 'Default';

  const version = moduleVersion(module);
  if (version) return version;

  const key = module.installation_key || module.module_name;
  if (key && key !== module.module_name) return key;

  return module.status && module.status !== 'installed'
    ? module.status
    : 'Default';
}
