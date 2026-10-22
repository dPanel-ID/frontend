import { LoaderCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useSidepanelEmit } from '@/services/sidepanel/model/event';
import { useToaster } from '@/services/toaster';

import { ApiUser } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useDcContext } from '../../model';

/** Save and cancel for the panel, in the Cta slot the layout provides. */
export default function Actions() {
  const { form, props } = useDcContext();
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const emit = useSidepanelEmit();

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    // Hold the panel open while the request is in flight, so a stray click
    // outside cannot drop half-saved changes.
    emit('%%sidepanel/allow-trivial-close', false);

    const fullname = values.fullname.trim();
    const avatarUrl = values.avatar_url?.trim() ?? '';
    const password = values.password?.trim() ? values.password : '';

    const response = await ApiUser.Profile.Update.doPost({
      payload: {
        avatar: avatarUrl,
        avatar_url: avatarUrl,
        displayName: fullname,
        fullname,
        ...(password ? { password } : {}),
      },
    });

    if (response.$status === 'failed') {
      openToaster({
        title: t('sidepanel.userEdit.failedTitle'),
        message: response.error.message,
        variant: 'error',
        duration: 5000,
      });

      emit('%%sidepanel/allow-trivial-close', true);
      return;
    }

    emit('%%sidepanel/close', null);

    openToaster({
      variant: 'success',
      message: t('sidepanel.userEdit.successMessage'),
    });

    props.onSubmitSuccess?.();
  });

  return (
    <>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          t('sidepanel.userEdit.submit')
        )}
      </Button>
      <Button
        buttonStyle="outline"
        buttonColor="secondary"
        disabled={isSubmitting}
        onClick={() => emit('%%sidepanel/close', null)}
      >
        {t('common.actions.cancel')}
      </Button>
    </>
  );
}
