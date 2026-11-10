import type { DTOs } from '@/shared/api';

/** The module that can be recorded from an existing installation. */
export const ADOPTABLE_MODULE = 'mariadb';

/** Adoption is offered only while dPanel has no record of the module. */
export function canOfferModuleAdoption(
  modules: Array<Pick<DTOs.ModuleInstallationV1, 'module_name' | 'name'>>,
): boolean {
  return !modules.some(
    (module) =>
      (module.module_name || module.name || '').toLowerCase() ===
      ADOPTABLE_MODULE,
  );
}

/** Whether dPanel recorded this module instead of installing it. */
export function isAdoptedModule(
  module: Pick<DTOs.ModuleInstallationV1, 'source'>,
): boolean {
  return module.source === 'adopted';
}
