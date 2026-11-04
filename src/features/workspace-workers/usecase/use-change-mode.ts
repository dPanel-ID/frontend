import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiWorkers } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { WorkersMode } from '../rules/types';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/**
 * Confirms, then switches the workspace between dPanel's shared workers and
 * its private ones. Every job of the workspace follows the new mode.
 */
export default function useChangeModeUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const t = useDevetekTranslations('widget.workers');
  const tCommon = useDevetekTranslations('common.actions');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [pendingMode, setPendingMode] = useState<WorkersMode | null>(null);

  const handleUsecase = useHandler((mode: WorkersMode) => {
    const apply = async () => {
      setPendingMode(mode);
      const response = await ApiWorkers.Mode.doPut({ workspaceId, mode });
      setPendingMode(null);

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.modeError'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message:
          mode === 'private'
            ? t('toaster.modePrivate')
            : t('toaster.modeShared'),
      });
      onSuccess();
    };

    openDialog({
      title:
        mode === 'private'
          ? t('modeDialog.privateTitle')
          : t('modeDialog.sharedTitle'),
      content:
        mode === 'private'
          ? t('modeDialog.privateMessage')
          : t('modeDialog.sharedMessage'),
      variant: 'warning',
      actions: [
        { label: tCommon('cancel') },
        {
          label:
            mode === 'private'
              ? t('modeDialog.privateConfirm')
              : t('modeDialog.sharedConfirm'),
          isPrimary: true,
          onClick: apply,
        },
      ],
    });
  });

  return [handleUsecase, pendingMode] as const;
}
