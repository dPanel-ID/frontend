import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiWorkers } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { WorkerRow } from '../rules/types';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/** Confirms, then removes a worker; it can no longer take jobs. */
export default function useRemoveWorkerUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const t = useDevetekTranslations('widget.workers');
  const tCommon = useDevetekTranslations('common.actions');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((worker: WorkerRow) => {
    const remove = async () => {
      const response = await ApiWorkers.$Id.Remove.doDelete({
        workspaceId,
        id: worker.id,
      });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.removeError', { name: worker.name }),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: t('toaster.removeSuccess', { name: worker.name }),
      });
      onSuccess();
    };

    openDialog({
      title: t('removeDialog.title', { name: worker.name }),
      content:
        worker.kind === 'github'
          ? t('removeDialog.messageGithub')
          : t('removeDialog.messageVm'),
      variant: 'error',
      actions: [
        { label: tCommon('cancel') },
        { label: t('removeDialog.confirm'), isPrimary: true, onClick: remove },
      ],
    });
  });

  return [handleUsecase] as const;
}
