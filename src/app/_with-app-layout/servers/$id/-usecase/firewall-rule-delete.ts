import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface FirewallRuleDeletePayload {
  serverId: string;
  ruleId: string;
  /** Readable rule, such as "allow 8080/tcp from anywhere". */
  ruleLabel: string;
  onSuccess?: () => void;
}

/** Confirms, then removes one stored rule. Locked rules never reach here. */
export default function useFirewallRuleDelete() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const tCommon = useDevetekTranslations('common.actions');
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const deleteRule = useHandler((payload: FirewallRuleDeletePayload) => {
    const { onSuccess, ruleId, ruleLabel, serverId } = payload;

    const remove = async () => {
      setDeletingRuleId(ruleId);
      const response = await ApiServer.Firewall.$Id.Rules.$RuleId.doDelete({
        serverId,
        ruleId,
      });
      setDeletingRuleId((current) => (current === ruleId ? null : current));

      if (response.$status === 'failed') {
        // Shown as the API words it: 409 for locked rules, 403 when the
        // workspace role cannot change this server.
        openToaster({
          variant: 'error',
          title: t('deleteDialog.errorTitle'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({ variant: 'success', message: t('deleteDialog.success') });
      onSuccess?.();
    };

    openDialog({
      title: t('deleteDialog.title'),
      content: t('deleteDialog.message', { rule: ruleLabel }),
      variant: 'warning',
      actions: [
        { label: tCommon('cancel') },
        { label: t('deleteDialog.confirm'), isPrimary: true, onClick: remove },
      ],
    });
  });

  return { deleteRule, deletingRuleId };
}
