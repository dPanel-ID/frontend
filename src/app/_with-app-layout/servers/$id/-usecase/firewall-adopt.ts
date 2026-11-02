import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface FirewallAdoptPayload {
  serverId: string;
  onSuccess?: () => void;
}

/**
 * Adopts the server's own ufw rules as stored rules. The API adopts every
 * rule it can represent at once, so the dialog says so before it runs.
 */
export default function useFirewallAdopt() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const tCommon = useDevetekTranslations('common.actions');
  const [isAdopting, setIsAdopting] = useState(false);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const adopt = useHandler((payload: FirewallAdoptPayload) => {
    const { onSuccess, serverId } = payload;

    const run = async () => {
      setIsAdopting(true);
      const response = await ApiServer.Firewall.$Id.Import.doPost({
        serverId,
        payload: { legacy: false },
      });
      setIsAdopting(false);

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('adoptDialog.errorTitle'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: t('adoptDialog.success', {
          created: response.created?.length ?? 0,
          skipped: response.skipped?.length ?? 0,
        }),
      });
      onSuccess?.();
    };

    openDialog({
      title: t('adoptDialog.title'),
      content: t('adoptDialog.message'),
      variant: 'info',
      actions: [
        { label: tCommon('cancel') },
        { label: t('adoptDialog.confirm'), isPrimary: true, onClick: run },
      ],
    });
  });

  return { adopt, isAdopting };
}
