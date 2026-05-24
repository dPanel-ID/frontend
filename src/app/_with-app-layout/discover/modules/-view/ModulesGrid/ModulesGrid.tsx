import { useMemo } from 'react';

import {
  HARDCODED_SERVER_MODULES,
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { ApiModule } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { FailedState } from '@/widgets/failed-state';

import { useFiltersContext } from '../../-model/filters';

import { ModulesGridLayout } from './_presentation/Layout';
import { ModuleCard } from './ModuleCard';

const CATEGORY_LABELS = new Map(
  SERVER_MODULES_CATEGORY.map((category) => [category.id, category.name]),
);

function titleize(value: string) {
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

function toServerModule(
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
    name: module.name || staticModule?.name || titleize(module.id),
    description: module.description || staticModule?.description || '',
    logoUrl: resolveServerModuleLogo({
      id: module.id,
      icon: module.icon,
      logoUrl: staticModule?.logoUrl,
    }),
    has_submodule: hasSubmodule(module),
    actions: module.actions,
    source: 'catalog',
    refName,
    resolvedCommit,
  };
}

export default function ModulesGrid() {
  const { serverID } = useFiltersContext();
  const [response] = ApiModule.Find.useGet({
    serverId: serverID ? String(serverID) : undefined,
  });

  const catalog =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;

  const modules = useMemo(() => {
    return (
      catalog?.modules.map((module) =>
        toServerModule(
          module,
          catalog.repository.ref.name,
          catalog.repository.ref.resolved_commit,
        ),
      ) ?? []
    );
  }, [catalog]);

  const groupedModules = useMemo(() => {
    return modules.reduce<Record<string, ServerModule[]>>((acc, module) => {
      const category = module.category[0] ?? 'utilities';
      acc[category] ??= [];
      acc[category].push(module);
      return acc;
    }, {});
  }, [modules]);

  const categories = useMemo(() => {
    return Object.keys(groupedModules).sort((a, b) => {
      const knownA = CATEGORY_LABELS.has(a) ? 0 : 1;
      const knownB = CATEGORY_LABELS.has(b) ? 0 : 1;
      if (knownA !== knownB) return knownA - knownB;
      return titleize(a).localeCompare(titleize(b));
    });
  }, [groupedModules]);

  if (response.$status === 'loading' && !catalog) {
    return (
      <div className="py-10 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed' && !catalog) {
    return <FailedState.WallCentered />;
  }

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-primary/70">
        No modules are available from the selected IaC repository.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => {
        const modulesInCategory = groupedModules[category] ?? [];
        const name = CATEGORY_LABELS.get(category) ?? titleize(category);

        return (
          <div key={category}>
            <h3 className="text-lg font-bold text-primary mb-2">{name}</h3>
            <ModulesGridLayout>
              {modulesInCategory.map((mod) => {
                return (
                  <ModulesGridLayout.Item key={mod.id}>
                    <ModuleCard moduleInfo={mod} />
                  </ModulesGridLayout.Item>
                );
              })}
            </ModulesGridLayout>
          </div>
        );
      })}
    </div>
  );
}
