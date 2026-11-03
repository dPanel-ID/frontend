import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiAdmin } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { AdminTaskActionPayload as Payload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

/**
 * Confirms, then hands a task to the next free worker. The API refuses with
 * a 409 when the task is already waiting, already finished, or its worker
 * reported progress recently; that message is shown as the API words it.
 */
export default function useReclaimTaskUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations('page.adminTasks');
  const tCommon = useDevetekTranslations('common.actions');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((payload: Payload) => {
    const { executionId, serverHostname, type, workerId } = payload;

    const reclaim = async () => {
      const response = await ApiAdmin.Task.$Id.Reclaim.doPost({
        executionId,
      });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.reclaimError'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      const previousWorker = response.previous_worker_id?.trim();
      openToaster({
        variant: 'success',
        title: t('toaster.reclaimSuccess'),
        message:
          response.action === 'restarted'
            ? t('toaster.reclaimRestarted')
            : previousWorker
              ? t('toaster.reclaimRequeuedFrom', { worker: previousWorker })
              : t('toaster.reclaimRequeued'),
      });
      onSuccess();
    };

    openDialog({
      title: t('reclaimDialog.title'),
      content: t('reclaimDialog.message', {
        id: executionId,
        type: type ?? t('table.unknownType'),
        server: serverHostname ?? t('table.noServer'),
        worker: workerId ?? t('table.noWorker'),
      }),
      variant: 'warning',
      actions: [
        { label: tCommon('cancel') },
        {
          label: t('reclaimDialog.confirm'),
          isPrimary: true,
          onClick: reclaim,
        },
      ],
    });
  });

  return [handleUsecase] as const;
}
