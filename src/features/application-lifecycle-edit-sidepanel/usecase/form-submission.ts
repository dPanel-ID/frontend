import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { lifecyclePatch } from '@/entities/application/lib/lifecycle';

import { ApiApplication } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useApplicationLifecycleEditModel } from '../model';
import { useEmit, useSubscribe } from '../model/events';

/**
 * Saves the four sections, and only them: the rest of the definition,
 * variables included, stays as stored. Emptied sections are sent as null
 * so they are removed.
 */
export default function useFormSubmissionUsecase() {
  const { props, draft, hasErrors, onSuccess, setIsSubmitting } =
    useApplicationLifecycleEditModel();
  const t = useDevetekTranslations('sidepanel.applicationLifecycleEdit');
  const [openToaster] = useToaster();
  const emit = useEmit();

  const handleSubmit = useHandler(async () => {
    if (hasErrors) return;
    setIsSubmitting(true);
    try {
      const response = await ApiApplication.Update.$Id.doPost({
        applicationId: String(props.applicationId),
        payload: { app_definition: lifecyclePatch(draft) },
      });
      if (response.$status === 'success') {
        openToaster({
          variant: 'success',
          message: t('saved', { name: props.applicationName }),
        });
        emit('#application-lifecycle-edit-sidepanel/sidepanel-close', {
          bypass: true,
        });
        onSuccess();
        return;
      }
      openToaster({
        variant: 'error',
        title: t('saveFailed'),
        message: response.error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  useSubscribe('#application-lifecycle-edit-sidepanel/form-submit', () => {
    void handleSubmit();
  });
}
