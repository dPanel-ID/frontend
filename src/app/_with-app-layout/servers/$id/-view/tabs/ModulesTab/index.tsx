import { useMemo, useState } from 'react';

import {
  Layers3Icon,
  PlusIcon,
  PuzzleIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useEmit } from '../../../-model/events';
import { useServerDataModel } from '../../../-model/server-data';

import { ModulesTabStates as UIStates } from './_States';
import ModulesList from './ModulesList';

type ServerDataModelSource = ReturnType<typeof useServerDataModel>;

const [guard, useServerModules] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Failed,
})(couple(useServerDataModel, (s) => (s as ServerDataModelSource).modules));

/** Everything dPanel installed here, with the catalog one click away. */
export default guard(function ModulesTab() {
  const t = useDevetekTranslations('page.serverDetail.modules');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const emit = useEmit();
  const [openToaster] = useToaster();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modules] = useServerModules((s) => [s.modules]);
  const [serverId, refreshModuleInventory, refreshModules] = useServerDataModel(
    (s) => [String(s.serverId), s.refreshModuleInventory, s.refreshModules],
  );

  const installed = modules.filter(
    (module) => module.status === 'installed',
  ).length;
  const moduleCount = new Set(
    modules.map((module) => module.module_name || module.name),
  ).size;
  const attention = modules.length - installed;

  const visibleModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return modules;
    return modules.filter((module) =>
      [module.module_name, module.name, module.display_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [modules, searchQuery]);

  const handleClickAdd = () => {
    emit('@servers::detail/favorite-navigation', { to: 'modules-discover' });
  };

  const handleClickRefresh = async () => {
    setIsRefreshing(true);
    const response = await refreshModuleInventory();
    setIsRefreshing(false);

    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: t('refreshFailed'),
        message: getApiErrorDetail(response.error),
      });
      return;
    }

    openToaster({ variant: 'success', message: t('refreshed') });
  };

  if (modules.length < 1) {
    return (
      <UIStates.Empty
        isRefreshing={isRefreshing}
        onClickAdd={handleClickAdd}
        onClickRefresh={handleClickRefresh}
      />
    );
  }

  return (
    <DataPanel
      icon={PuzzleIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            disabled={isRefreshing}
            onClick={handleClickRefresh}
          >
            <RefreshCwIcon className={cn(isRefreshing && 'animate-spin')} />
            {t('refresh')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky', 'h-8 px-3 text-xs')}
            onClick={handleClickAdd}
          >
            <PlusIcon className="size-4" />
            {t('add')}
          </button>
        </>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={PuzzleIcon}
            tone="sky"
            label={t('tiles.modules')}
            value={moduleCount}
          />
          <StatTile
            size="sm"
            icon={Layers3Icon}
            tone="emerald"
            label={t('tiles.installed')}
            value={installed}
          />
          <StatTile
            size="sm"
            icon={ShieldAlertIcon}
            tone={attention > 0 ? 'amber' : 'neutral'}
            label={t('tiles.attention')}
            value={attention}
          />
        </>
      }
      toolbar={
        <>
          <DataPanelSearch
            value={searchQuery}
            placeholder={t('searchPlaceholder')}
            onChange={setSearchQuery}
          />
          <DataPanelMeta>
            {tCommon('rows', { count: visibleModules.length })}
          </DataPanelMeta>
        </>
      }
    >
      {visibleModules.length === 0 ? (
        <DataPanelState state="empty" title={t('noMatch')} />
      ) : (
        <ModulesList
          modules={visibleModules}
          serverId={serverId}
          onDeleted={refreshModules}
        />
      )}
    </DataPanel>
  );
});
