import { useState } from 'react';

import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { MachineList } from './MachineList';
import { submitMachineSelection } from './submit-selection';
import type { SelectMachineModalProps as Props } from './types';

export default function SelectMachineModal(props: Props) {
  const emitModal = useModalEmit();
  const {
    allowEmptySelection = false,
    confirmLabel = 'Confirm',
    description,
    initialSelectedMachineIds = [],
    onMachinesSelected,
    selectionMode = 'single',
    title = 'Select Machine',
  } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(
    initialSelectedMachineIds,
  );

  const isMultiple = selectionMode === 'multiple';

  return (
    <ModalLayoutGeneral>
      <ModalLayoutGeneral.Title canClickClose={!isSubmitting} title={title} />

      <ModalLayoutGeneral.Content className="flex flex-col gap-2">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        <MachineList
          {...props}
          selectedMachineIds={selectedMachineIds}
          setSelectedMachineIds={setSelectedMachineIds}
        />
        {errorMessage ? (
          <p aria-live="polite" className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {isMultiple && allowEmptySelection && selectedMachineIds.length === 0 ? (
          <p className="text-sm text-amber-700">
            Saving with no selected machines will remove every member from this
            group.
          </p>
        ) : null}
      </ModalLayoutGeneral.Content>

      {isMultiple ? (
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isSubmitting}
            onClick={() => emitModal('%%modal/close', null)}
          >
            Cancel
          </Button>
          <Button
            disabled={
              (!allowEmptySelection && selectedMachineIds.length === 0) ||
              isSubmitting
            }
            onClick={async () => {
              setErrorMessage('');
              setIsSubmitting(true);

              const result = await submitMachineSelection({
                machineIds: selectedMachineIds,
                onMachinesSelected,
              });

              setIsSubmitting(false);

              if (!result.shouldClose) {
                setErrorMessage(result.error ?? 'Unable to submit selection.');
                return;
              }

              emitModal('%%modal/close', null);
            }}
          >
            {isSubmitting ? 'Saving...' : confirmLabel}
          </Button>
        </div>
      ) : null}
    </ModalLayoutGeneral>
  );
}
