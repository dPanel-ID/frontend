import { useMemo, useState } from 'react';

import {
  CheckCircle2Icon,
  Layers3Icon,
  PlayIcon,
  PuzzleIcon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import {
  SERVER_MODULE_CATEGORY_LABELS,
  titleizeModuleValue,
  toServerModuleFromCatalog,
} from '@/entities/server-modules/lib/catalog';
import type { ServerModule } from '@/entities/server-modules/model/types';

import {
  ServerManagementIconButton,
  ServerManagementMetric,
  ServerManagementSidepanel,
  ServerManagementState,
  ServerManagementSurface,
  ServerManagementToolbar,
} from '@/features/server-management-sidepanel-ui';
import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { ApiModule, ApiServer } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';

import type { ServerModulesDiscoverSidepanelProps as Props } from '../rules/types';

export default function ServerModulesDiscoverSidepanel(props: Props) {
  const { serverId, serverName } = props;

  const [query, setQuery] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [playbookName, setPlaybookName] = useState('Custom server playbook');
  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const [response, refreshCatalog] = ApiModule.Find.useGet({
    serverId,
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
        toServerModuleFromCatalog(
          module,
          catalog.repository.ref.name,
          catalog.repository.ref.resolved_commit,
        ),
      ) ?? []
    );
  }, [catalog]);

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return modules;

    return modules.filter((module) => {
      return [
        module.id,
        module.name,
        module.description,
        module.category.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [modules, query]);

  const groupedModules = useMemo(() => {
    return filteredModules.reduce<Record<string, ServerModule[]>>(
      (acc, module) => {
        const category = module.category[0] ?? 'utilities';
        acc[category] ??= [];
        acc[category].push(module);
        return acc;
      },
      {},
    );
  }, [filteredModules]);

  const categories = useMemo(() => {
    return Object.keys(groupedModules).sort((a, b) => {
      const knownA = SERVER_MODULE_CATEGORY_LABELS.has(a) ? 0 : 1;
      const knownB = SERVER_MODULE_CATEGORY_LABELS.has(b) ? 0 : 1;
      if (knownA !== knownB) return knownA - knownB;
      return titleizeModuleValue(a).localeCompare(titleizeModuleValue(b));
    });
  }, [groupedModules]);

  const selectedModules = useMemo(() => {
    const selected = new Set(selectedModuleIds);
    return modules.filter((module) => selected.has(module.id));
  }, [modules, selectedModuleIds]);

  const installedCount = modules.filter(
    (module) => module.installationStatus === 'installed',
  ).length;

  const handleTogglePlaybookModule = (moduleId: string) => {
    setSelectedModuleIds((current) => {
      if (current.includes(moduleId)) {
        return current.filter((id) => id !== moduleId);
      }

      return [...current, moduleId];
    });
  };

  const handleRunCustomPlaybook = () => {
    if (!selectedModules.length || !catalog) return;

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
              server_id: serverId,
              name: playbookName.trim() || 'Custom server playbook',
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
    setIsRefreshingInventory(true);
    const refreshResponse = await ApiServer.Modules.$Id.Refresh.doPost({
      serverId,
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

  const isLoading = response.$status === 'loading';
  const hasCatalog = Boolean(catalog);

  return (
    <ServerManagementSidepanel
      classNameFrame="w-[calc(100svw_-_16px)] max-w-[1120px]"
      title="Discover Modules"
      subtitle={serverName || `Server ID: ${serverId}`}
      icon={PuzzleIcon}
      heading="Server role catalog"
      description="Install individual roles or compose a reusable playbook without leaving this server."
      actions={
        <ServerManagementIconButton
          label="Reload catalog"
          icon={RefreshCwIcon}
          disabled={isLoading}
          isLoading={isLoading}
          onClick={() => refreshCatalog()}
        />
      }
      metrics={
        <>
          <ServerManagementMetric
            label="Available"
            value={hasCatalog ? modules.length : '-'}
            icon={PuzzleIcon}
          />
          <ServerManagementMetric
            label="Installed"
            value={hasCatalog ? installedCount : '-'}
            icon={CheckCircle2Icon}
          />
          <ServerManagementMetric
            label="Selected"
            value={selectedModules.length}
            icon={Layers3Icon}
          />
        </>
      }
    >
      <ServerManagementToolbar>
        <label className="relative min-w-[260px] flex-1">
          <span className="sr-only">Search modules</span>
          <Input
            className="pl-9"
            inputSize="sm"
            value={query}
            placeholder="Search modules"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </label>

        <Button
          size="sm"
          buttonColor="secondary"
          buttonStyle="outline"
          disabled={isRefreshingInventory}
          onClick={handleRefreshInventory}
        >
          <RefreshCwIcon
            className={cn('size-4', isRefreshingInventory && 'animate-spin')}
          />
          Refresh installed
        </Button>
      </ServerManagementToolbar>

      <ServerManagementSurface
        title="Custom playbook"
        description="Select modules below, name the playbook, then run them together."
        className="mb-4"
      >
        <div className="grid gap-3 p-3 md:grid-cols-[1fr_auto]">
          <Input
            value={playbookName}
            placeholder="Custom server playbook"
            onChange={(event) => setPlaybookName(event.target.value)}
          />
          <Button
            buttonColor="primary"
            disabled={!selectedModules.length || !catalog}
            onClick={handleRunCustomPlaybook}
          >
            <PlayIcon className="size-4" />
            Run playbook ({selectedModules.length})
          </Button>
        </div>

        {selectedModules.length > 0 ? (
          <div className="border-t bg-background/60 px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {selectedModules.map((module) => (
                <span
                  key={module.id}
                  className="rounded-md border bg-card px-2 py-1 text-xs font-medium text-primary/70"
                >
                  {module.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </ServerManagementSurface>

      {isLoading && !hasCatalog ? (
        <ServerManagementState
          state="loading"
          title="Loading module catalog"
          description="Reading the selected IaC modules repository."
        />
      ) : response.$status === 'failed' && !hasCatalog ? (
        <ServerManagementState
          state="failed"
          title="Failed to load modules"
          description={response.error.message}
          action={
            <ServerManagementIconButton
              label="Retry"
              icon={RefreshCwIcon}
              onClick={() => refreshCatalog()}
            />
          }
        />
      ) : filteredModules.length === 0 ? (
        <ServerManagementState
          title={query ? 'No modules match the search' : 'No modules available'}
          description={
            query
              ? 'Try another module name, category, or runtime.'
              : 'The selected IaC repository did not expose any modules.'
          }
        />
      ) : (
        <div className="grid gap-5">
          {categories.map((category) => {
            const modulesInCategory = groupedModules[category] ?? [];
            const name =
              SERVER_MODULE_CATEGORY_LABELS.get(category) ??
              titleizeModuleValue(category);

            return (
              <section key={category} className="grid gap-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {name}
                </h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {modulesInCategory.map((module) => (
                    <DiscoverModuleCard
                      key={module.id}
                      moduleInfo={module}
                      serverId={serverId}
                      selectedForPlaybook={selectedModuleIds.includes(
                        module.id,
                      )}
                      onTogglePlaybook={handleTogglePlaybookModule}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </ServerManagementSidepanel>
  );
}

interface DiscoverModuleCardProps {
  moduleInfo: ServerModule;
  serverId: string;
  selectedForPlaybook: boolean;
  onTogglePlaybook: (moduleId: string) => void;
}

function DiscoverModuleCard(props: DiscoverModuleCardProps) {
  const {
    moduleInfo,
    serverId,
    selectedForPlaybook,
    onTogglePlaybook,
  } = props;

  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const status = moduleInfo.installationStatus;
  const isInstalled = status === 'installed';

  const handleClickMoreDetail = () => {
    openServerModulesDetailModal({
      moduleInfo,
      serverID: Number(serverId),
    });
  };

  return (
    <div className="grid min-h-[210px] gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex min-w-0 gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background">
          <img
            src={moduleInfo.logoUrl}
            alt=""
            className="size-7 object-contain"
          />
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-semibold text-primary">
              {moduleInfo.name}
            </h4>
            {status ? (
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                  isInstalled
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                    : 'bg-background text-muted-foreground',
                )}
              >
                {status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-3 text-sm leading-5 text-muted-foreground">
            {moduleInfo.description || 'No description available.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 self-end">
        <Button
          className="flex-1"
          size="sm"
          buttonColor={selectedForPlaybook ? 'primary' : 'secondary'}
          buttonStyle={selectedForPlaybook ? 'flat' : 'outline'}
          onClick={() => onTogglePlaybook(moduleInfo.id)}
        >
          {selectedForPlaybook ? 'Added' : 'Add to playbook'}
        </Button>
        <Button
          className="flex-1"
          size="sm"
          buttonColor="secondary"
          buttonStyle="outline"
          onClick={handleClickMoreDetail}
        >
          More detail
        </Button>
      </div>
    </div>
  );
}
