import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface ModuleAdoptPayload {
  serverId: string;
  moduleName: string;
  onSuccess?: () => void;
}

/** Checks the server first, then asks before recording what it found. */
export default function useModuleAdopt() {
  const t = useDevetekTranslations('page.serverDetail.modules.adopt');
  const [isChecking, setIsChecking] = useState(false);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const adoptModule = useHandler(async (payload: ModuleAdoptPayload) => {
    const { moduleName, onSuccess, serverId } = payload;

    setIsChecking(true);
    const check = await ApiServer.Modules.$Id.Adopt.doPost({
      moduleName,
      payload: { dry_run: true },
      serverId,
    });
    setIsChecking(false);

    if (check.$status === 'failed') {
      openToaster({
        variant: 'error',
        title: t('checkFailed'),
        message: getApiErrorDetail(check.error),
      });
      return;
    }

    const name = [check.display_name, check.version].filter(Boolean).join(' ');

    openDialog({
      title: t('dialogTitle', { module: name }),
      content: t('dialogMessage', { module: name, port: check.port }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const response = await ApiServer.Modules.$Id.Adopt.doPost({
            moduleName,
            payload: { dry_run: false },
            serverId,
          });

          if (response.$status === 'failed') {
            openToaster({
              variant: 'error',
              title: t('failed', { module: name }),
              message: getApiErrorDetail(response.error),
            });
            return;
          }

          openToaster({
            variant: 'success',
            message: t('success', { module: name }),
          });
          onSuccess?.();
        },
      },
    });
  });

  return { adoptModule, isChecking };
}
