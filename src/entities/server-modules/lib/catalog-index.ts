import type { DTOs } from '@/shared/api';

/** What the module catalog says about a module, keyed by module ID. */
export interface CatalogModuleLook {
  category?: string;
  iconUrl?: string;
  name?: string;
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
  for (const module of modules ?? []) {
    if (!module.id) continue;
    index.set(module.id, {
      category: module.category?.trim() || undefined,
      iconUrl: module.icon_url?.trim() || undefined,
      name: module.name.trim() || undefined,
    });
  }
  return index;
}
