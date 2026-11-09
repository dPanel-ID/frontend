import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServiceAccounts } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { AccountRow } from '../rules/types';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/** Confirms, then deletes an account and every token it has. */
export default function useDeleteAccountUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const t = useDevetekTranslations('widget.serviceAccounts');
  const tCommon = useDevetekTranslations('common.actions');
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((account: AccountRow) => {
    const remove = async () => {
      const response = await ApiServiceAccounts.$Id.Remove.doDelete({
        workspaceId,
        id: account.id,
      });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.deleteError', { name: account.name }),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: t('toaster.deleteSuccess', { name: account.name }),
      });
      onSuccess();
    };

    openDialog({
      title: t('deleteDialog.title', { name: account.name }),
      content: t('deleteDialog.message'),
      variant: 'error',
      actions: [
        { label: tCommon('cancel') },
        { label: t('deleteDialog.confirm'), isPrimary: true, onClick: remove },
      ],
    });
  });

  return [handleUsecase] as const;
}
