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
 * Confirms, then fails a task so its deployment, server or module can be
 * retried. Destructive: the work the task was doing is abandoned.
 */
export default function useDeleteTaskUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations('page.adminTasks');
  const tCommon = useDevetekTranslations('common.actions');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((payload: Payload) => {
    const { executionId, serverHostname, type } = payload;

    const remove = async () => {
      const response = await ApiAdmin.Task.$Id.Delete.doDelete({
        executionId,
      });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.deleteError'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        title: t('toaster.deleteSuccess'),
        message: response.worker_stopped
          ? t('toaster.deleteWorkerStopped')
          : t('toaster.deleteNoWorker'),
      });
      onSuccess();
    };

    openDialog({
      title: t('deleteDialog.title'),
      content: t('deleteDialog.message', {
        id: executionId,
        type: type ?? t('table.unknownType'),
        server: serverHostname ?? t('table.noServer'),
      }),
      variant: 'error',
      actions: [
        { label: tCommon('cancel') },
        { label: t('deleteDialog.confirm'), isPrimary: true, onClick: remove },
      ],
    });
  });

  return [handleUsecase] as const;
}
