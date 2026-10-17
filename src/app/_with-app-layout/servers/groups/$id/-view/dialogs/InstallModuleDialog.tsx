import { useMemo, useState } from 'react';

import { ChevronRightIcon, PuzzleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  SERVER_MODULE_CATEGORY_LABELS,
  titleizeModuleValue,
  toServerModuleFromCatalog,
} from '@/entities/server-modules/lib/catalog';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { useRetainedResponseData } from '@/features/server-groups/usecase/use-retained-response-data';
import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { ApiModule } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import { useGroupDetailModel } from '../../-model/group';

import { DialogShell } from './DialogShell';

/** Picks a catalog module; the install form itself is the module modal. */
export function InstallModuleDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.module');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const { dialog, group, groupId, setDialog, showOperation } =
    useGroupDetailModel();
  const [openServerModulesDetailModal] = useServerModulesDetailModal();
  const open = dialog?.kind === 'module';
  const [query, setQuery] = useState('');

  const [response, refresh] = ApiModule.Find.useGet({
    options: { skip: !open },
  });
  const catalog = useRetainedResponseData(response);

  const modules = useMemo<ServerModule[]>(() => {
    const data = catalog.data;
    if (!data) return [];
    return data.modules.map((module) =>
      toServerModuleFromCatalog(
        module,
        data.repository.ref.name,
        data.repository.ref.resolved_commit,
      ),
    );
  }, [catalog.data]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return modules;
    return modules.filter((module) =>
      [module.id, module.name, module.description, module.category.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [modules, query]);

  const close = () => {
    setDialog(null);
    setQuery('');
  };

  const handlePick = (module: ServerModule) => {
    if (!group) return;
    close();
    openServerModulesDetailModal({
      moduleInfo: module,
      hostGroupTarget: {
        id: groupId,
        label: group.name,
        memberCount: group.memberCount,
      },
      onOperationQueued: showOperation,
    });
  };

  return (
    <DialogShell
      open={open}
      onClose={close}
      icon={PuzzleIcon}
      title={t('title')}
      description={t('description', { name: group?.name ?? '' })}
      className="max-w-2xl"
      footer={
        <Button buttonStyle="outline" buttonColor="secondary" onClick={close}>
          {t('cancel')}
        </Button>
      }
    >
      <DataPanelSearch
        value={query}
        placeholder={t('searchPlaceholder')}
        onChange={setQuery}
      />

      {response.$status === 'loading' && modules.length === 0 ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : response.$status === 'failed' && modules.length === 0 ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(response.error)}
          action={<DataPanelRetry onClick={() => refresh()} />}
        />
      ) : visible.length === 0 ? (
        <DataPanelState state="empty" title={t('noMatch')} />
      ) : (
        <div className="grid max-h-[50vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visible.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => handlePick(module)}
              className="flex items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-sky-500/5 hover:shadow-lg hover:shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-black/5 bg-white p-1.5 shadow-sm">
                <img
                  src={module.logoUrl}
                  alt=""
                  className="size-full object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {module.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {SERVER_MODULE_CATEGORY_LABELS.get(
                    module.category[0] ?? '',
                  ) ?? titleizeModuleValue(module.category[0] ?? 'utilities')}
                </span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </DialogShell>
  );
}
