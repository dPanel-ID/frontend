import { useMemo, useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import {
  HARDCODED_SERVER_MODULES,
  SERVER_MODULES_CATEGORY,
  resolveServerModuleLogo,
} from '@/entities/server-modules/config/registry';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { ApiModule, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Input } from '@/shared/presentation/atoms/Input';
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
      logoUrl: module.icon_url || staticModule?.logoUrl,
    }),
    has_submodule: hasSubmodule(module),
    actions: module.actions,
    source: 'catalog',
    refName,
    resolvedCommit,
    installation: module.installation,
    installationStatus: module.installation?.status,
  };
}

export default function ModulesGrid() {
  const { serverID } = useFiltersContext();
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [playbookName, setPlaybookName] = useState('Custom server playbook');
  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [response, refreshCatalog] = ApiModule.Find.useGet({
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

  const selectedModules = useMemo(() => {
    const selected = new Set(selectedModuleIds);
    return modules.filter((module) => selected.has(module.id));
  }, [modules, selectedModuleIds]);

  const handleTogglePlaybookModule = (moduleId: string) => {
    setSelectedModuleIds((current) => {
      if (current.includes(moduleId)) {
        return current.filter((id) => id !== moduleId);
      }
      return [...current, moduleId];
    });
  };

  const handleRunCustomPlaybook = () => {
    if (!serverID || selectedModules.length === 0 || !catalog) return;

    openDialog({
      title: 'Run custom playbook',
      content: (
        <>
          Run {selectedModules.length} selected role
          {selectedModules.length > 1 ? 's' : ''} on this server?
        </>
      ),
      variant: 'info',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const runResponse = await ApiModule.Custom.Run.doPost({
            payload: {
              server_id: String(serverID),
              name: playbookName,
              ref: {
                name: catalog.repository.ref.name,
                expected_commit: catalog.repository.ref.resolved_commit,
              },
              roles: selectedModules.map((module) => ({
                name: module.id,
              })),
            },
          });

          if (runResponse.$status === 'failed') {
            openToaster({
              variant: 'error',
              title: <>Failed to run custom playbook</>,
              message:
                'message' in runResponse.error
                  ? runResponse.error.message
                  : 'Unable to start the playbook.',
            });
            return;
          }

          openToaster({
            variant: 'success',
            message: <>Custom playbook was queued successfully.</>,
          });
          setSelectedModuleIds([]);
          refreshCatalog();
        },
      },
    });
  };

  const handleRefreshInventory = async () => {
    if (!serverID) return;
    setIsRefreshingInventory(true);
    const refreshResponse = await ApiServer.Modules.$Id.Refresh.doPost({
      serverId: String(serverID),
    });
    setIsRefreshingInventory(false);

    if (refreshResponse.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: <>Refresh failed</>,
        message:
          'message' in refreshResponse.error
            ? refreshResponse.error.message
            : 'Unable to refresh server modules.',
      });
      return;
    }

    refreshCatalog();
    openToaster({
      variant: 'success',
      message: <>Server modules refreshed.</>,
    });
  };

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
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-primary">Custom Playbook</h3>
          <p className="text-sm text-primary/60">
            Select several roles, give the playbook a simple name, then run them
            in one ordered server task.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            value={playbookName}
            onChange={(event) => setPlaybookName(event.target.value)}
            placeholder="Custom server playbook"
          />
          <Button
            disabled={!serverID || selectedModules.length === 0}
            onClick={handleRunCustomPlaybook}
          >
            Run playbook ({selectedModules.length})
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
          <p className="text-xs text-primary/60">
            Refresh reads module metadata from the selected server through the
            active agent.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={!serverID || isRefreshingInventory}
            onClick={handleRefreshInventory}
          >
            Refresh installed modules
          </Button>
        </div>

        {selectedModules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedModules.map((module) => (
              <span
                key={module.id}
                className="rounded-md bg-background px-2 py-1 text-xs font-medium text-primary/70"
              >
                {module.name}
              </span>
            ))}
          </div>
        )}
      </div>

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
                    <ModuleCard
                      moduleInfo={mod}
                      selectedForPlaybook={selectedModuleIds.includes(mod.id)}
                      onTogglePlaybook={handleTogglePlaybookModule}
                    />
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
