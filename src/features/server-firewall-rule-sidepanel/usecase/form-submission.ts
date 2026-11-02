import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { useServerFirewallRuleModel } from '../model';
import { useEmit, useSubscribe } from '../model/events';
import { toFirewallRuleRequest } from '../rules/form-schema';

export default function useFormSubmissionUsecase() {
  const { form, onSuccess, serverId, setSubmitError } =
    useServerFirewallRuleModel();
  const t = useDevetekTranslations('sidepanel.firewallRule');
  const [openToaster] = useToaster();
  const sidepanelEmit = useEmit();

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const response = await ApiServer.Firewall.$Id.Rules.doPost({
      serverId,
      payload: toFirewallRuleRequest(values),
    });

    if (response.$status === 'failed') {
      setSubmitError(getApiErrorDetail(response.error));
      return;
    }

    openToaster({ variant: 'success', message: t('success') });
    sidepanelEmit('#server-firewall-rule-sidepanel/sidepanel-close', {
      bypass: true,
    });
    onSuccess();
  });

  useSubscribe('#server-firewall-rule-sidepanel/form-submit', () =>
    handleSubmit(),
  );
}
