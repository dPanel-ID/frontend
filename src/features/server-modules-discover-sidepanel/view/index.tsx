import { useMemo, useState } from 'react';

import {
  CheckCircle2Icon,
  Layers3Icon,
  PlusIcon,
  PuzzleIcon,
  RefreshCwIcon,
  SettingsIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';
import { useToaster } from '@/services/toaster';

import {
  SERVER_MODULE_CATEGORY_LABELS,
  titleizeModuleValue,
  toServerModuleFromCatalog,
} from '@/entities/server-modules/lib/catalog';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { ApiHostGroup, ApiModule, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import type { ServerModulesDiscoverSidepanelProps as Props } from '../rules/types';

const ALL_CATEGORIES = 'all';

/**
 * The module catalog as a storefront: logos, one line of what each module
 * is, and a single Install action that opens the install form.
 */
export default function ServerModulesDiscoverSidepanel(props: Props) {
  const {
    serverId,
    serverName,
    hostGroupId,
    onHostGroupOperationQueued,
    onModuleQueued,
  } = props;
  const t = useDevetekTranslations('sidepanel.modulesDiscover');
  const tCommon = useDevetekTranslations('common.dataPanel');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [isRefreshingInventory, setIsRefreshingInventory] = useState(false);
  const [openToaster] = useToaster();

  const [response, refreshCatalog] = ApiModule.Find.useGet({ serverId });
  const [hostGroupResponse] = ApiHostGroup.Detail.$Id.useGet({
    id: hostGroupId ?? '',
    options: { skip: !hostGroupId },
  });

  const catalog =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;

  const modules = useMemo(
    () =>
      catalog?.modules.map((module) =>
        toServerModuleFromCatalog(
          module,
          catalog.repository.ref.name,
          catalog.repository.ref.resolved_commit,
        ),
      ) ?? [],
    [catalog],
  );

  const categories = useMemo(() => {
    const ids = new Set(
      modules.map((module) => module.category[0] ?? 'utilities'),
    );
    return [...ids].sort((a, b) => {
      const knownA = SERVER_MODULE_CATEGORY_LABELS.has(a) ? 0 : 1;
      const knownB = SERVER_MODULE_CATEGORY_LABELS.has(b) ? 0 : 1;
      if (knownA !== knownB) return knownA - knownB;
      return categoryLabel(a).localeCompare(categoryLabel(b));
    });
  }, [modules]);

  const visibleModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return modules.filter((module) => {
      if (
        category !== ALL_CATEGORIES &&
        (module.category[0] ?? 'utilities') !== category
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
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
  }, [category, modules, query]);

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
        title: t('refreshFailed'),
        message: getApiErrorDetail(refreshResponse.error),
      });
      return;
    }

    refreshCatalog();
    openToaster({ variant: 'success', message: t('refreshed') });
  };

  const isLoading = response.$status === 'loading';
  const hasCatalog = Boolean(catalog);
  const hostGroupTarget =
    hostGroupResponse.$status === 'success'
      ? {
          id: String(hostGroupResponse.id),
          label: hostGroupResponse.name || `Group ${hostGroupResponse.id}`,
          memberCount: hostGroupResponse.members.length,
        }
      : undefined;

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[1120px]">
      <Layout.Title
        title={t('title')}
        subtitle={serverName || `Server ID: ${serverId}`}
        hasCloseButton
      />

      <Layout.Content className="bg-background pb-4 pt-1">
        <DataPanel
          icon={PuzzleIcon}
          title={t('heading')}
          description={t('description')}
          actions={
            <>
              <Button
                size="sm"
                buttonColor="secondary"
                buttonStyle="outline"
                disabled={isRefreshingInventory}
                onClick={handleRefreshInventory}
              >
                <RefreshCwIcon
                  className={cn(isRefreshingInventory && 'animate-spin')}
                />
                {t('refreshInstalled')}
              </Button>
              <Button
                size="sm"
                buttonColor="secondary"
                buttonStyle="outline"
                disabled={isLoading}
                onClick={() => refreshCatalog()}
              >
                <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
                {t('reload')}
              </Button>
            </>
          }
          tiles={
            <>
              <StatTile
                size="sm"
                icon={PuzzleIcon}
                tone="sky"
                label={t('tiles.available')}
                value={hasCatalog ? modules.length : '-'}
              />
              <StatTile
                size="sm"
                icon={CheckCircle2Icon}
                tone="emerald"
                label={t('tiles.installed')}
                value={hasCatalog ? installedCount : '-'}
              />
              <StatTile
                size="sm"
                icon={Layers3Icon}
                label={t('tiles.categories')}
                value={hasCatalog ? categories.length : '-'}
              />
            </>
          }
          toolbar={
            <>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <DataPanelSearch
                  value={query}
                  placeholder={t('searchPlaceholder')}
                  onChange={setQuery}
                />
                <div role="radiogroup" className="flex flex-wrap gap-1.5">
                  {[ALL_CATEGORIES, ...categories].map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={category === item}
                      onClick={() => setCategory(item)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
                        category === item
                          ? 'border-sky-400/60 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          : 'bg-background text-muted-foreground hover:text-primary',
                      )}
                    >
                      {item === ALL_CATEGORIES ? t('all') : categoryLabel(item)}
                    </button>
                  ))}
                </div>
              </div>
              <DataPanelMeta>
                {tCommon('rows', { count: visibleModules.length })}
              </DataPanelMeta>
            </>
          }
        >
          {isLoading && !hasCatalog ? (
            <DataPanelState state="loading" title={t('loading')} />
          ) : response.$status === 'failed' && !hasCatalog ? (
            <DataPanelState
              state="failed"
              title={t('failed')}
              description={getApiErrorDetail(response.error)}
              action={<DataPanelRetry onClick={() => refreshCatalog()} />}
            />
          ) : visibleModules.length === 0 ? (
            <DataPanelState
              state="empty"
              title={
                query || category !== ALL_CATEGORIES ? t('noMatch') : t('empty')
              }
            />
          ) : (
            <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  hostGroupTarget={hostGroupTarget}
                  moduleInfo={module}
                  onHostGroupOperationQueued={onHostGroupOperationQueued}
                  onModuleQueued={onModuleQueued}
                  serverId={serverId}
                  serverName={serverName}
                />
              ))}
            </div>
          )}
        </DataPanel>
      </Layout.Content>
    </Layout>
  );
}

function categoryLabel(id: string) {
  return SERVER_MODULE_CATEGORY_LABELS.get(id) ?? titleizeModuleValue(id);
}

interface ModuleCardProps {
  hostGroupTarget?: { id: string; label: string; memberCount: number };
  moduleInfo: ServerModule;
  onHostGroupOperationQueued?: (groupId: string, operationId: string) => void;
  onModuleQueued?: () => void;
  serverId: string;
  serverName?: string;
}

function ModuleCard(props: ModuleCardProps) {
  const {
    hostGroupTarget,
    moduleInfo,
    onHostGroupOperationQueued,
    onModuleQueued,
    serverId,
    serverName,
  } = props;
  const t = useDevetekTranslations('sidepanel.modulesDiscover');
  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const isInstalled = moduleInfo.installationStatus === 'installed';

  const handleOpen = () => {
    openServerModulesDetailModal({
      hostGroupTarget,
      moduleInfo,
      onOperationQueued: (operationId) => {
        if (!hostGroupTarget) return;
        onHostGroupOperationQueued?.(hostGroupTarget.id, operationId);
      },
      onServerInstallQueued: onModuleQueued,
      serverID: Number(serverId),
      serverName,
    });
  };

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        isInstalled && 'border-emerald-500/30',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-black/5 bg-white p-2 shadow-sm">
          <img
            src={moduleInfo.logoUrl}
            alt=""
            className="size-full object-contain"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <h4 className="truncate text-sm font-bold text-primary">
              {moduleInfo.name}
            </h4>
            {isInstalled && (
              <StatusPill tone="success" label={t('installed')} />
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {categoryLabel(moduleInfo.category[0] ?? 'utilities')}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 min-h-8 text-sm leading-4 text-muted-foreground">
        {moduleInfo.description || t('noDescription')}
      </p>

      <div className="mt-auto flex justify-end">
        {isInstalled ? (
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            onClick={handleOpen}
          >
            <SettingsIcon className="size-4" />
            {t('manage')}
          </Button>
        ) : (
          <button
            type="button"
            className={flowCtaClassName('sky', 'h-8 px-3 text-xs')}
            onClick={handleOpen}
          >
            <PlusIcon className="size-4" />
            {t('install')}
          </button>
        )}
      </div>
    </article>
  );
}
