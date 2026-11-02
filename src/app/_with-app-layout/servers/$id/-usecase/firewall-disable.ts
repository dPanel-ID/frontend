import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface FirewallDisablePayload {
  serverId: string;
  /** The policy version on screen; a stale one is refused with 409. */
  version: number;
  onQueued?: (executionId: string | null | undefined) => void;
  onFailed?: () => void;
}

/** Confirms, then queues the job that turns ufw off. Rules are kept. */
export default function useFirewallDisable() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const tCommon = useDevetekTranslations('common.actions');
  const [isDisabling, setIsDisabling] = useState(false);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const disable = useHandler((payload: FirewallDisablePayload) => {
    const { onFailed, onQueued, serverId, version } = payload;

    const run = async () => {
      setIsDisabling(true);
      const response = await ApiServer.Firewall.$Id.Disable.doPost({
        serverId,
        payload: { version },
      });
      setIsDisabling(false);

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('disableDialog.errorTitle'),
          message: getApiErrorDetail(response.error),
        });
        onFailed?.();
        return;
      }

      openToaster({ variant: 'success', message: t('disableDialog.queued') });
      onQueued?.(response.execution_id);
    };

    openDialog({
      title: t('disableDialog.title'),
      content: t('disableDialog.message'),
      variant: 'warning',
      actions: [
        { label: tCommon('cancel') },
        { label: t('disableDialog.confirm'), isPrimary: true, onClick: run },
      ],
    });
  });

  return { disable, isDisabling };
}
