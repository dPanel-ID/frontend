import { useState } from 'react';

import { PuzzleIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Button } from '@/shared/presentation/atoms/Button';
import CardSectionTitled from '@/shared/presentation/molecules/CardSectionTitled';

import { useEmit } from '../../-model/events';
import { useServerDataModel } from '../../-model/server-data';

import { MainModulesStates as UIStates } from './_States';
import ModulesList from './ModulesList';

const [guard, useServerModules] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Failed,
})(couple(useServerDataModel, (s: any) => s.modules));

export default guard(function MainModules() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const emit = useEmit();
  const [modules] = useServerModules((s) => [s.modules]);
  const [serverId, refreshModuleInventory, refreshModules] = useServerDataModel(
    (s) => [String(s.serverId), s.refreshModuleInventory, s.refreshModules],
  );
  const [openToaster] = useToaster();

  const t = useDevetekTranslations();

  const handleClickRefresh = async () => {
    setIsRefreshing(true);
    const response = await refreshModuleInventory();
    setIsRefreshing(false);
    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: <>Refresh failed</>,
        message:
          'message' in response.error
            ? response.error.message
            : 'Unable to refresh server modules.',
      });
      return;
    }
    openToaster({
      variant: 'success',
      message: <>Server modules refreshed.</>,
    });
  };

  if (!modules || modules.length < 1) {
    return <UIStates.Empty />;
  }

  const handleClickDiscover = () => {
    emit('@servers::detail/favorite-navigation', {
      to: 'modules-discover',
    });
  };

  return (
    <CardSectionTitled
      placement="main"
      title={t('common.terms.installedModules')}
      icon={PuzzleIcon}
      toolbarActions={{
        label: t('common.actions.discover'),
        onClick: handleClickDiscover,
      }}
      toolbarContent={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleClickDiscover}>
            {t('common.actions.discover')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isRefreshing}
            onClick={handleClickRefresh}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <ModulesList
        modules={modules}
        serverId={serverId}
        onDeleted={refreshModules}
      />
    </CardSectionTitled>
  );
});
