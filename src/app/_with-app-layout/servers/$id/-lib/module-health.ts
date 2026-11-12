import type {
  ModuleHealthDto,
  ModuleServiceDto,
} from '@/shared/api/server.modules.$id.health';

/** Health of installed modules by installation ID. */
export type ModuleHealthIndex = Map<string, ModuleHealthDto>;

export function indexModuleHealth(
  modules: ModuleHealthDto[] | undefined,
): ModuleHealthIndex {
  return new Map(
    (modules ?? []).map((module) => [module.installation_id, module]),
  );
}

/** The units of an installation that are not running, if any. */
export function servicesNeedingAttention(
  health: ModuleHealthIndex,
  installationId: string,
): ModuleServiceDto[] {
  const module = health.get(installationId);
  if (!module?.needs_attention) return [];
  return module.services.filter(
    (service) =>
      service.state === 'failed' ||
      service.state === 'stopped' ||
      service.state === 'missing',
  );
}
