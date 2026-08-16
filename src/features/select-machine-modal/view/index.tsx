import { useState } from 'react';

import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { MachineList } from './MachineList';
import type { SelectMachineModalProps as Props } from './types';

export default function SelectMachineModal(props: Props) {
  const emitModal = useModalEmit();
  const {
    confirmLabel = 'Confirm',
    description,
    initialSelectedMachineIds = [],
    onMachinesSelected,
    selectionMode = 'single',
    title = 'Select Machine',
  } = props;
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>(
    initialSelectedMachineIds,
  );

  const isMultiple = selectionMode === 'multiple';

  return (
    <ModalLayoutGeneral>
      <ModalLayoutGeneral.Title canClickClose title={title} />

      <ModalLayoutGeneral.Content className="flex flex-col gap-2">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        <MachineList
          {...props}
          selectedMachineIds={selectedMachineIds}
          setSelectedMachineIds={setSelectedMachineIds}
        />
      </ModalLayoutGeneral.Content>

      {isMultiple ? (
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => emitModal('%%modal/close', null)}
          >
            Cancel
          </Button>
          <Button
            disabled={selectedMachineIds.length === 0}
            onClick={() => {
              onMachinesSelected?.(selectedMachineIds);
              emitModal('%%modal/close', null);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      ) : null}
    </ModalLayoutGeneral>
  );
}
