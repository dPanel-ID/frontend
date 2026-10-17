import { useState } from 'react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import {
  DataPanelMeta,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';

import { MachineCard } from '../../presentation/MachineCard';
import { toSelectableMachine } from '../machine-options';
import type { SelectMachineModalProps as Props } from '../types';

interface MachineListProps extends Props {
  selectedMachineIds: string[];
  setSelectedMachineIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const PAGE_SIZE = 12;

export default function MachineList(props: MachineListProps) {
  const {
    disabledMachineIds = [],
    disabledReason,
    onMachineSelected,
    selectedMachineIds,
    selectionMode = 'single',
    setSelectedMachineIds,
  } = props;
  const t = useDevetekTranslations('modal.selectMachine');
  const tCommon = useDevetekTranslations('common.dataPanel');

  const emitModal = useModalEmit();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { userProfile } = useAuthLoggedIn();

  const [response, refresh] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page,
    pageSize: PAGE_SIZE,
    searchQuery: searchQuery.trim() || undefined,
    userId: userProfile.id,
  });

  const machines =
    response.$status === 'success'
      ? (response.machines ?? [])
      : response.$status === 'loading' && response.prevData
        ? (response.prevData.machines ?? [])
        : [];
  const pagination =
    response.$status === 'success'
      ? response.pagination
      : response.$status === 'loading'
        ? response.prevData?.pagination
        : undefined;
  const selectableMachines = machines
    .map((machine) => toSelectableMachine(machine))
    .filter((machine) => machine != null);
  const totalPage = Math.max(1, pagination?.total_page ?? 1);

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DataPanelSearch
          value={searchQuery}
          placeholder={t('searchPlaceholder')}
          onChange={(value) => {
            setSearchQuery(value);
            setPage(1);
          }}
        />
        <DataPanelMeta>
          {selectionMode === 'multiple'
            ? t('selectedCount', { count: selectedMachineIds.length })
            : tCommon('rows', { count: pagination?.total_item ?? 0 })}
        </DataPanelMeta>
      </div>

      {response.$status === 'failed' && selectableMachines.length === 0 ? (
        <DataPanelState
          state="failed"
          title={t('loadFailed')}
          description={getApiErrorDetail(response.error)}
          action={<DataPanelRetry onClick={() => refresh()} />}
        />
      ) : response.$status === 'loading' && selectableMachines.length === 0 ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : selectableMachines.length === 0 ? (
        <DataPanelState
          state="empty"
          title={searchQuery ? t('noMatch') : t('empty')}
        />
      ) : (
        <div
          aria-label={t('listLabel')}
          className="grid max-h-[50vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
          role={selectionMode === 'multiple' ? 'group' : 'radiogroup'}
        >
          {selectableMachines.map((machine) => {
            const isSelected = selectedMachineIds.includes(machine.id);
            const isDisabled = disabledMachineIds.includes(machine.id);

            return (
              <MachineCard
                key={machine.id}
                checked={isSelected}
                disabled={isDisabled}
                disabledReason={isDisabled ? disabledReason : undefined}
                machineName={machine.hostname}
                machinePublicIP={machine.address}
                provider={machine.provider}
                region={machine.region}
                status={machine.status}
                onClickSelect={() => {
                  if (selectionMode === 'multiple') {
                    setSelectedMachineIds((current) =>
                      current.includes(machine.id)
                        ? current.filter((id) => id !== machine.id)
                        : [...current, machine.id],
                    );
                    return;
                  }

                  emitModal('%%modal/close', null);
                  onMachineSelected?.(machine.id);
                }}
                selected={isSelected}
                selectionRole={
                  selectionMode === 'multiple' ? 'checkbox' : 'radio'
                }
              />
            );
          })}
        </div>
      )}

      {totalPage > 1 && (
        <div className="flex items-center justify-between gap-2">
          <DataPanelPagination
            page={Math.min(page, totalPage)}
            totalPage={totalPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
