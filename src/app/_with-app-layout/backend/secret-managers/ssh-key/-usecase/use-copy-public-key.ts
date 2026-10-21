import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { SshKeyCopyPublicKeyPayload as Payload } from '../-rules/usecase-types';

/**
 * Copies the public half of a key. Keys returned by the list endpoint do not
 * always carry it, so the failure path points at the detail page instead of
 * silently doing nothing.
 */
export default function useCopyPublicKeyUsecase() {
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler(async (payload: Payload) => {
    const publicKey = payload.publicKey?.trim();

    if (!publicKey) {
      openToaster({
        variant: 'warning',
        message: t('page.sshKeys.toaster.noPublicKey'),
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(publicKey);
      openToaster({
        variant: 'success',
        message: t('page.sshKeys.toaster.copied'),
      });
    } catch {
      openToaster({
        variant: 'error',
        message: t('page.sshKeys.toaster.copyFailed'),
      });
    }
  });

  return [handleUsecase] as const;
}
