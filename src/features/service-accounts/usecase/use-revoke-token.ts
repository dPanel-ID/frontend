import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServiceAccounts } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { AccountRow, TokenRow } from '../rules/types';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/** Confirms, then revokes a token; anything using it stops working. */
export default function useRevokeTokenUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const t = useDevetekTranslations('widget.serviceAccounts');
  const tCommon = useDevetekTranslations('common.actions');
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((account: AccountRow, token: TokenRow) => {
    const revoke = async () => {
      const response =
        await ApiServiceAccounts.$Id.Tokens.$TokenId.Revoke.doDelete({
          workspaceId,
          id: account.id,
          tokenId: token.id,
        });

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.revokeError', { name: token.name }),
          message: getApiErrorDetail(response.error),
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: t('toaster.revokeSuccess', { name: token.name }),
      });
      onSuccess();
    };

    openDialog({
      title: t('revokeDialog.title', { name: token.name }),
      content: t('revokeDialog.message'),
      variant: 'error',
      actions: [
        { label: tCommon('cancel') },
        { label: t('revokeDialog.confirm'), isPrimary: true, onClick: revoke },
      ],
    });
  });

  return [handleUsecase] as const;
}
