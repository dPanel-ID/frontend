import type { DTOs } from '@/shared/api';

/** What the module catalog says about a module, keyed by module ID. */
export interface CatalogModuleLook {
  category?: string;
  iconUrl?: string;
  name?: string;
  /** Set on a child module, offered only from its parent. */
  parent?: string;
}

/**
 * Indexes the catalog by module ID. The catalog (the iac-modules manifests)
 * is the source of truth for a module's category; the frontend registry only
 * covers the modules it was written for.
 */
export function indexCatalogModules(
  modules: DTOs.ModuleCatalogItemV1[] | undefined,
): Map<string, CatalogModuleLook> {
  const index = new Map<string, CatalogModuleLook>();
  const add = (module: DTOs.ModuleCatalogItemV1, parent?: string) => {
    if (!module.id) return;
    index.set(module.id, {
      category: module.category?.trim() || undefined,
      iconUrl: module.icon_url?.trim() || undefined,
      name: module.name.trim() || undefined,
      parent: module.parent?.trim() || parent,
    });
  };
  for (const module of modules ?? []) {
    add(module);
    for (const child of module.children ?? []) add(child, module.id);
  }
  return index;
}
