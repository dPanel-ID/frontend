import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiWorkers } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { toWorkerSecretResult } from '../lib/workers';
import type { WorkerRow } from '../rules/types';
import { useWorkerTokenModal } from '../view/WorkerTokenModal';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/**
 * Confirms, then gives a VM worker a new token and shows it once. The old
 * token stops working, so the host must be updated.
 */
export default function useRotateTokenUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const t = useDevetekTranslations('widget.workers');
  const tCommon = useDevetekTranslations('common.actions');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [openTokenModal] = useWorkerTokenModal();

  const handleUsecase = useHandler((worker: WorkerRow) => {
    const rotate = async () => {
      const response = await ApiWorkers.$Id.Token.doPost({
        workspaceId,
        id: worker.id,
      });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.rotateError', { name: worker.name }),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      onSuccess();
      openTokenModal({ result: toWorkerSecretResult(response) });
    };

    openDialog({
      title: t('rotateDialog.title', { name: worker.name }),
      content: t('rotateDialog.message'),
      variant: 'warning',
      actions: [
        { label: tCommon('cancel') },
        { label: t('rotateDialog.confirm'), isPrimary: true, onClick: rotate },
      ],
    });
  });

  return [handleUsecase] as const;
}
