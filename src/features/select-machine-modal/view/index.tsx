import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { MachineList } from './MachineList';
import { submitMachineSelection } from './submit-selection';
import type { SelectMachineModalProps as Props } from './types';

export default function SelectMachineModal(props: Props) {
  const emitModal = useModalEmit();
  const t = useDevetekTranslations('modal.selectMachine');
  const {
    allowEmptySelection = false,
    confirmLabel,
    description,
    initialSelectedMachineIds = [],
    onMachinesSelected,
    selectionMode = 'single',
    title,
  } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>(
    initialSelectedMachineIds,
  );

  const isMultiple = selectionMode === 'multiple';

  return (
    <ModalLayoutGeneral maxWidth="760px">
      <ModalLayoutGeneral.Title
        canClickClose={!isSubmitting}
        title={title ?? t('title')}
        description={description}
      />

      <ModalLayoutGeneral.Content className="flex flex-col gap-3">
        <MachineList
          {...props}
          selectedMachineIds={selectedMachineIds}
          setSelectedMachineIds={setSelectedMachineIds}
        />
        {errorMessage ? (
          <p
            aria-live="polite"
            className="text-sm text-red-600 dark:text-red-300"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        {isMultiple &&
        allowEmptySelection &&
        selectedMachineIds.length === 0 ? (
          <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            {t('emptySelectionWarning')}
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
            {t('cancel')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
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
                setErrorMessage(result.error || t('submitFailed'));
                return;
              }

              emitModal('%%modal/close', null);
            }}
          >
            {isSubmitting ? t('saving') : (confirmLabel ?? t('confirm'))}
          </button>
        </div>
      ) : null}
    </ModalLayoutGeneral>
  );
}
