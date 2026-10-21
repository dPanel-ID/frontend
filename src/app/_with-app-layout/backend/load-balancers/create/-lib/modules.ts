import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';
import type { ServerCard } from '@/entities/server/rules/schema';
import type { ServerModule } from '@/entities/server-modules/model/types';

import type { DTOs } from '@/shared/api';

import type { LoadBalancerRuntimeItem } from '../-model/form';
import type { CreateResources } from '../-model/resources';

export function getServerName(server: ServerCard) {
  return server.host.name || server.host.address || server.id;
}

export function getSelectedServer(
  resources: CreateResources,
  serverId?: string,
) {
  if (resources.servers.$status !== 'success') return undefined;

  return resources.servers.list.find((server) => server.id === serverId);
}

export function getSelectedInfrastructureModule(
  resources: CreateResources,
  engine?: string,
) {
  if (!engine) return undefined;

  const modules =
    resources.infrastructureModules.$status === 'success'
      ? resources.infrastructureModules
      : resources.infrastructureModules.$status === 'loading'
        ? resources.infrastructureModules.prevData
        : undefined;

  return modules?.list.find((module) => module.id === engine);
}

export function getWebserverEngineMetadata(engine?: string) {
  const normalized = normalizeLoadBalancerEngine(engine);
  const knownEngine = normalized as keyof typeof LOAD_BALANCER_WEBSERVER_ENGINE;

  if (knownEngine in LOAD_BALANCER_WEBSERVER_ENGINE) {
    return LOAD_BALANCER_WEBSERVER_ENGINE[knownEngine];
  }

  return LOAD_BALANCER_WEBSERVER_ENGINE.unknown;
}

export function normalizeLoadBalancerEngine(engine?: string) {
  switch (String(engine ?? '').toLowerCase()) {
    case 'caddyserver':
    case 'dpanel-router':
      return 'caddy';
    default:
      return engine ?? 'unknown';
  }
}

export function mergeCatalogModulesWithServerInventory(
  modules: ServerModule[],
  inventory: DTOs.ModuleInstallationV1[],
) {
  if (inventory.length < 1) return modules;

  return modules.map((module) => {
    const inventoryInstallations = inventory.filter((installation) =>
      moduleMatchesInventoryInstallation(module, installation),
    );

    if (inventoryInstallations.length < 1) return module;

    const installations = dedupeModuleInstallations([
      ...moduleInstallations(module),
      ...inventoryInstallations,
    ]);

    return {
      ...module,
      installation: installations[0] ?? module.installation,
      installations,
      installationStatus: installations[0]?.status ?? module.installationStatus,
    };
  });
}

export function moduleMatchesInventoryInstallation(
  module: ServerModule,
  installation: DTOs.ModuleInstallationV1,
) {
  const moduleNames = [
    module.id,
    module.installerName,
    normalizeLoadBalancerEngine(module.id),
    normalizeLoadBalancerEngine(module.installerName),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeModuleAlias);

  const installationNames = [
    installation.module_name,
    installation.name,
    installation.installation_key?.split('@')[0],
    installation.inventory_path?.split(/[/@:]/)[0],
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeModuleAlias);

  return moduleNames.some((moduleName) =>
    installationNames.includes(moduleName),
  );
}

export function normalizeModuleAlias(value?: string) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (['caddy', 'caddyserver', 'dpanel-router'].includes(normalized)) {
    return 'caddyserver';
  }

  if (['go', 'golang'].includes(normalized)) {
    return 'go';
  }

  return normalized;
}

export function dedupeModuleInstallations(
  installations: DTOs.ModuleInstallationSummaryV1[],
) {
  const deduped = new Map<string, DTOs.ModuleInstallationSummaryV1>();

  for (const installation of installations) {
    deduped.set(moduleInstallationIdentity(installation), installation);
  }

  return Array.from(deduped.values());
}

export function moduleInstallationIdentity(
  installation: DTOs.ModuleInstallationSummaryV1,
) {
  const id = (installation as { id?: string }).id;

  return (
    id ||
    installation.installation_key ||
    [
      installation.status,
      installation.module_ref,
      installation.module_commit,
      installation.variables_hash,
    ]
      .filter(Boolean)
      .join(':')
  );
}

export function moduleInstallations(module: ServerModule) {
  return module.installations?.length
    ? module.installations
    : module.installation
      ? [module.installation]
      : [];
}

export function hasInstalledModule(module: ServerModule) {
  return moduleInstallations(module).some(
    (installation) => installation.status === 'installed',
  );
}

export function hasReportedGatewayModule(module: ServerModule) {
  return moduleInstallations(module).some((installation) =>
    ['installed', 'installing', 'progress'].includes(installation.status),
  );
}

export function moduleInstallationLabels(module: ServerModule) {
  const labels = moduleInstallations(module)
    .map((installation) => moduleInstallationLabel(module, installation))
    .filter((label): label is string => Boolean(label));

  return Array.from(new Set(labels)).slice(0, 3);
}

export function moduleInstallationLabel(
  module: ServerModule,
  installation: DTOs.ModuleInstallationSummaryV1,
) {
  const key = installation.installation_key;
  const version = key?.match(/@([^:]+)(?::|$)/)?.[1];
  if (version && version !== 'default') return version;

  if (key && key !== module.id && key !== module.installerName) return key;

  return '';
}

export function runtimeItemFromInfrastructureModule(
  moduleInfo: ServerModule,
  detail: DTOs.ModuleCatalogDetailV1,
): LoadBalancerRuntimeItem | undefined {
  const action =
    detail.action_details.find((item) => item.name === 'install') ??
    detail.action_details[0];
  const roles = action?.roles?.length
    ? action.roles
    : (detail.source.roles ?? [detail.id]);

  if (!roles.length) return undefined;

  const variables = buildDefaultModuleVariables(detail.inputs);
  const name = moduleInfo.installerName || detail.id || moduleInfo.id;
  const version =
    getModuleVersion(name, variables) ||
    getModuleVersion(moduleInfo.id, variables);
  const installationKey = buildModuleInstallationKey(
    name,
    version,
    detail.install_strategy,
  );

  return {
    name,
    title: detail.name || moduleInfo.name,
    version,
    category: 'infrastructure',
    roles,
    installationKey,
    variables: buildLoadBalancerEngineVariables(name, variables),
    source: 'load-balancer.pipeline',
    moduleRef: detail.input_catalog.ref_name || moduleInfo.refName,
    moduleSourceCommit: detail.resolved_commit || moduleInfo.resolvedCommit,
  };
}

export function buildDefaultModuleVariables(inputs: DTOs.ModuleInputV1[]) {
  return inputs.reduce<Record<string, unknown>>((acc, input) => {
    if (input.default == null) return acc;
    acc[input.name] = input.default;
    return acc;
  }, {});
}

export function buildLoadBalancerEngineVariables(
  moduleName: string,
  variables: Record<string, unknown>,
) {
  const normalizedName = moduleName.trim().toLowerCase();

  if (
    ['caddy', 'caddyserver', 'dpanel-router'].includes(normalizedName) &&
    variables.router_action == null
  ) {
    return {
      ...variables,
      router_action: 'install',
    };
  }

  return variables;
}

export function buildModuleInstallationKey(
  moduleName: string,
  version: string,
  installStrategy?: string,
) {
  const normalizedStrategy = installStrategy?.trim().toLowerCase();

  if (normalizedStrategy === 'versioned' && version) {
    return `${moduleName}@${version}:system`;
  }

  return moduleName;
}

export function getModuleVersion(
  moduleId: string,
  variables: Record<string, unknown>,
) {
  const id = moduleId.toLowerCase();
  const get = (key: string) => {
    const value = variables[key];
    if (value == null) return '';
    if (Array.isArray(value)) return String(value[0] ?? '').trim();
    return String(value).trim();
  };

  const directVersion = get(`${id}_version`);
  if (directVersion) return directVersion;
  if (id === 'go' || id.includes('golang')) return get('golang_version');
  if (id === 'nodejs' || id.includes('node')) return get('nodejs_version');
  if (id === 'php' || id.includes('php')) return get('php_version');
  if (id === 'python') return get('python_version');

  for (const [key, value] of Object.entries(variables)) {
    if (!key.endsWith('_version') || value == null) continue;

    const version = Array.isArray(value)
      ? String(value[0] ?? '').trim()
      : String(value).trim();
    if (version) return version;
  }

  return '';
}
