import { useMemo, useState } from 'react';

import {
  CheckCircle2Icon,
  PuzzleIcon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react';

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
  ServerManagementToolbar,
} from '@/features/server-management-sidepanel-ui';
import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { ApiHostGroup, ApiModule, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';

import type { ServerModulesDiscoverSidepanelProps as Props } from '../rules/types';

export default function ServerModulesDiscoverSidepanel(props: Props) {
  const { serverId, serverName, hostGroupId, onHostGroupOperationQueued } =
    props;

  const [query, setQuery] = useState('');
  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);

  const [openToaster] = useToaster();

  const [response, refreshCatalog] = ApiModule.Find.useGet({
    serverId,
  });
  const [hostGroupResponse] = ApiHostGroup.Detail.$Id.useGet({
    id: hostGroupId ?? '',
    options: {
      skip: !hostGroupId,
    },
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

  const installedCount = modules.filter(
    (module) => module.installationStatus === 'installed',
  ).length;

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
        message: getApiErrorDetail(refreshResponse.error),
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
  const hostGroupTarget =
    hostGroupResponse.$status === 'success'
      ? {
          id: String(hostGroupResponse.id ?? ''),
          label: hostGroupResponse.name ?? `Group ${hostGroupResponse.id ?? ''}`,
          memberCount: hostGroupResponse.members?.length ?? 0,
        }
      : undefined;

  return (
    <ServerManagementSidepanel
      classNameFrame="w-[calc(100svw_-_16px)] max-w-[1120px]"
      title="Discover Modules"
      subtitle={serverName || `Server ID: ${serverId}`}
      icon={PuzzleIcon}
      heading="Server role catalog"
      description="Install individual roles from the selected server module catalog."
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
          description={getApiErrorDetail(response.error)}
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
                      hostGroupTarget={hostGroupTarget}
                      moduleInfo={module}
                      onHostGroupOperationQueued={onHostGroupOperationQueued}
                      serverId={serverId}
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
  hostGroupTarget?: {
    id: string;
    label: string;
    memberCount: number;
  };
  moduleInfo: ServerModule;
  onHostGroupOperationQueued?: (groupId: string, operationId: string) => void;
  serverId: string;
}

function DiscoverModuleCard(props: DiscoverModuleCardProps) {
  const { hostGroupTarget, moduleInfo, onHostGroupOperationQueued, serverId } =
    props;

  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const status = moduleInfo.installationStatus;
  const isInstalled = status === 'installed';

  const handleClickMoreDetail = () => {
    openServerModulesDetailModal({
      hostGroupTarget,
      moduleInfo,
      onOperationQueued: (operationId) => {
        if (!hostGroupTarget) return;

        onHostGroupOperationQueued?.(hostGroupTarget.id, operationId);
      },
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
