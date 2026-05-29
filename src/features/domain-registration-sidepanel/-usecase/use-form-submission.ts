import { useDevetekTranslations } from '@/services/i18n';
import { useSidepanelEmit } from '@/services/sidepanel/model/event';
import { useToaster } from '@/services/toaster';

import { ApiDomain } from '@/shared/api';

import { useSubscribe } from '../-model/events';
import { useDomainRegistrationModel } from '../-model/general';

export default function useFormSubmissionUsecase() {
  const { form, props } = useDomainRegistrationModel();
  const [openToaster] = useToaster();
  const sidepanelEmit = useSidepanelEmit();
  const t = useDevetekTranslations('sidepanel.domainRegistration.toaster');

  const handleSubmit = form.handleSubmit(async (values) => {
    const { domain, description, provider, apiToken } = values;

    const response = await ApiDomain.Create.doPost({
      domain,
      description,
      provider,
      credential: {
        token: apiToken,
      },
    });

    if (response.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: t('error'),
        message: response.error.message,
      });
      return;
    }

    openToaster({
      variant: 'success',
      message: t('success'),
    });

    props.onSuccess();
    sidepanelEmit('%%sidepanel/close', null);
  });

  useSubscribe('#domain-registration-sidepanel/form-submit', () =>
    handleSubmit(),
  );
}
