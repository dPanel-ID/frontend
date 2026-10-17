import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { MachineReinstallPayload } from './types';

interface Params {
  onSuccess: () => void;
}

/**
 * Holds the server waiting for a reinstall confirmation and queues the setup
 * workflow once it is given. The view renders the dialog from the state.
 */
export default function useMachineReinstallUsecase(params: Params) {
  const { onSuccess } = params;

  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const [target, setTarget] = useState<MachineReinstallPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUsecase = useHandler((payload: MachineReinstallPayload) => {
    setTarget(payload);
  });

  const close = useHandler(() => {
    if (!isSubmitting) setTarget(null);
  });

  const confirm = useHandler(async () => {
    if (!target || isSubmitting) return;
    const { serverId } = target;

    setIsSubmitting(true);
    try {
      const response = await ApiServer.Setup.$Id.doPost({ id: serverId });

      if (response.$status === 'success') {
        openToaster({
          variant: 'success',
          message: t.rich('toaster.machineReinstall.success', {
            code: (chunks) => <code>{chunks}</code>,
            machineID: serverId,
          }),
        });
        onSuccess();
        return;
      }

      openToaster({
        variant: 'error',
        title: t.rich('toaster.machineReinstall.error', {
          code: (chunks) => <code>{chunks}</code>,
          machineID: serverId,
        }),
        message: getApiErrorDetail(response.error),
      });
    } finally {
      setIsSubmitting(false);
      setTarget(null);
    }
  });

  return [handleUsecase, { target, isSubmitting, confirm, close }] as const;
}
