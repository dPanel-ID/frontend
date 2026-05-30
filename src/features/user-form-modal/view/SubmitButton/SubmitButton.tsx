import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { useToaster } from '@/services/toaster';

import { ApiUser } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useDcContext } from '../../model';

export default function SubmitButton() {
  const { props, form } = useDcContext();

  const [openToaster] = useToaster();
  const emitModal = useModalEmit();
  const t = useDevetekTranslations();

  const handleClick = form.handleSubmit(async (values) => {
    emitModal('%%modal/allow-trivial-close', false);

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
        title: <>{t('page.profile.modal.failedTitle')}</>,
        message: response.error.message,
        variant: 'error',
        duration: 5000,
      });

      emitModal('%%modal/allow-trivial-close', true);
      return;
    }

    emitModal('%%modal/close', null);

    openToaster({
      variant: 'success',
      message: <>{t('page.profile.modal.successMessage')}</>,
    });

    props.onSubmitSuccess?.();
  });

  return (
    <Button onClick={handleClick} disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? (
        <Spinner className="text-white" />
      ) : (
        t('page.profile.modal.submit')
      )}
    </Button>
  );
}
