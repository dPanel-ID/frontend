import { useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { useToaster } from '@/services/toaster';

import { ApiOrganizationPeople } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useDcContext } from '../../model';

export default function SubmitButton() {
  const { props, form } = useDcContext();

  const [openToaster] = useToaster();
  const emitModal = useModalEmit();
  const t = useDevetekTranslations();
  const [organizationId, userId, roles] = useWatch({
    control: form.control,
    name: ['organization_id', 'user_id', 'roles'],
  });

  const handleClick = form.handleSubmit(async (values) => {
    emitModal('%%modal/allow-trivial-close', false);

    const response = await ApiOrganizationPeople.Create.doPost({
      organizationId: values.organization_id,
      userId: values.user_id,
      roles: values.roles,
    });

    if (response.$status === 'failed') {
      openToaster({
        title: t('modal.addTeamMember.toaster.errorTitle'),
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
      message: t('modal.addTeamMember.toaster.successMessage'),
    });

    props.onSubmitSuccess?.();
  });

  const canSubmit =
    !form.formState.isSubmitting &&
    Boolean(organizationId) &&
    Boolean(userId) &&
    roles.length > 0;

  return (
    <Button onClick={handleClick} disabled={!canSubmit}>
      {form.formState.isSubmitting ? (
        <Spinner className="text-white" />
      ) : (
        t('modal.addTeamMember.submit')
      )}
    </Button>
  );
}
