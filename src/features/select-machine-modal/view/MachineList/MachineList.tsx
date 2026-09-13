import { useState } from 'react';

import { useAuthLoggedIn } from '@/services/auth';
import { useModalEmit } from '@/services/modal/model/event';

import { ApiServer } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { FailedState } from '@/widgets/failed-state';

import { MachineCard } from '../../presentation/MachineCard';
import type { SelectMachineModalProps as Props } from '../types';
import { toSelectableMachine } from '../machine-options';

interface MachineListProps extends Props {
  selectedMachineIds: string[];
  setSelectedMachineIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function MachineList(props: MachineListProps) {
  const {
    disabledMachineIds = [],
    onMachineSelected,
    selectedMachineIds,
    selectionMode = 'single',
    setSelectedMachineIds,
  } = props;

  const emitModal = useModalEmit();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { userProfile } = useAuthLoggedIn();

  const [response, refresh] = ApiServer.Find.useGet({
    filter: 'shared-with-me',
    page,
    pageSize: 20,
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
  const hasPreviousPage = (pagination?.page ?? page) > 1;
  const hasNextPage = (pagination?.page ?? page) < (pagination?.total_page ?? 1);

  if (response.$status === 'failed' && selectableMachines.length === 0) {
    return (
      <div className="grid gap-3">
        <FailedState.BannerRetryable onClickRetry={() => refresh()} />
        <p className="text-sm text-destructive">
          Unable to load machines for selection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <label className="grid gap-2">
        <span className="text-sm font-medium">Search machines</span>
        <Input
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Filter by hostname"
        />
      </label>

      {response.$status === 'loading' && selectableMachines.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : null}

      {response.$status !== 'loading' && selectableMachines.length === 0 ? (
        <div className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
          No machines match the current search.
        </div>
      ) : null}

      {selectableMachines.length > 0 ? (
        <div
          aria-label="Available machines"
          className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-2 [&>button]:basis-[calc(50%_-_0.25rem)]"
          role={selectionMode === 'multiple' ? 'group' : 'radiogroup'}
        >
          {selectableMachines.map((machine) => {
            const isSelected = selectedMachineIds.includes(machine.id);

            return (
              <MachineCard
                checked={isSelected}
                key={machine.id}
                disabled={disabledMachineIds.includes(machine.id)}
                machineName={machine.hostname}
                machinePublicIP={machine.address}
                onClickSelect={() => {
                  if (selectionMode === 'multiple') {
                    setSelectedMachineIds((current) =>
                      current.includes(machine.id)
                        ? current.filter((selectedId) => selectedId !== machine.id)
                        : [...current, machine.id],
                    );
                    return;
                  }

                  emitModal('%%modal/close', null);
                  onMachineSelected?.(machine.id);
                }}
                selected={isSelected}
                selectionRole={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
              />
            );
          })}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Page {pagination?.page ?? page} of {pagination?.total_page ?? 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!hasPreviousPage}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!hasNextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
