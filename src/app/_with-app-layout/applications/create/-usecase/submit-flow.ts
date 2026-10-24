import { useState } from 'react';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import useHandleDeploy from '../-model/handle-deploy';
import useHandleUpdateApplication from '../-model/handle-update';
import { useFormStore } from '../-model/store/form';

export interface SubmitFlow {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isUpdate: boolean;
}

/**
 * The flow's one primary action.
 *
 * It used to live inside the preview step, which was also the only step
 * that could reach it. The review panel owns it now, so it is lifted here
 * rather than being imported back out of a view.
 */
export function useSubmitFlow(): SubmitFlow {
  const [flowMode] = useFormStore((s) => [s.flowMode]);

  const { handleDeploy } = useHandleDeploy();
  const { handleUpdate } = useHandleUpdateApplication();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUpdate = flowMode === 'update';
  const submitAction = isUpdate ? handleUpdate : handleDeploy;

  const submit = useHandler(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const isSubmitted = await submitAction();
      if (!isSubmitted) setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  });

  return { submit, isSubmitting, isUpdate };
}
