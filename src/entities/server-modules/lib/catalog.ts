import {
  HARDCODED_SERVER_MODULES,
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import type { ServerModule } from '@/entities/server-modules/model/types';

import type { DTOs } from '@/shared/api';

export const SERVER_MODULE_CATEGORY_LABELS = new Map(
  SERVER_MODULES_CATEGORY.map((category) => [category.id, category.name]),
);

export function titleizeModuleValue(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveInstallerName(id: string) {
  switch (id) {
    case 'golang':
      return 'go';
    case 'caddy':
      return 'caddyserver';
    default:
      return id;
  }
}

function resolveInstallerType(module: DTOs.ModuleCatalogItemV1) {
  if (module.id === 'docker') return 'container';
  if (module.id === 'caddy') return 'infrastructure';
  return module.category ?? 'utilities';
}

function hasSubmodule(module: DTOs.ModuleCatalogItemV1) {
  if (module.category === 'language') return true;

  const staticModule = HARDCODED_SERVER_MODULES.find(
    (item) =>
      item.id === module.id || item.id === resolveInstallerName(module.id),
  );

  return staticModule?.has_submodule ?? false;
}

export function toServerModuleFromCatalog(
  module: DTOs.ModuleCatalogItemV1,
  refName?: string,
  resolvedCommit?: string,
): ServerModule {
  const staticModule = HARDCODED_SERVER_MODULES.find(
    (item) =>
      item.id === module.id || item.id === resolveInstallerName(module.id),
  );

  return {
    category: [module.category ?? 'utilities'],
    platform: module.platforms?.length ? module.platforms : ['vm'],
    id: module.id,
    installerName: resolveInstallerName(module.id),
    installerType: resolveInstallerType(module),
    name: module.name || staticModule?.name || titleizeModuleValue(module.id),
    description: module.description || staticModule?.description || '',
    logoUrl: resolveServerModuleLogo({
      id: module.id,
      icon: module.icon,
      logoUrl: module.icon_url || staticModule?.logoUrl,
    }),
    has_submodule: hasSubmodule(module),
    actions: module.actions,
    source: 'catalog',
    refName,
    resolvedCommit,
    installation: module.installation,
    installations: module.installations,
    installationStatus: module.installation?.status,
  };
}
