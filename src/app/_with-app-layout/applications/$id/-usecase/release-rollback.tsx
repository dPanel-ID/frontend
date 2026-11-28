import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiDeploy } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { ReleaseRollbackPayload } from '../-rules/usecase-types';

/** How long a refused rollback stays on screen: long enough to read it. */
const ERROR_TOAST_MS = 8000;

interface Params {
  onSuccess: () => void;
}

/**
 * Asks before switching the live release on one server back, then starts
 * it. The dialog says plainly what changes (only the code) and what does
 * not (database migrations, variables and settings), because a rollback
 * after a migration can leave old code talking to a newer schema.
 */
export default function useReleaseRollbackUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations(
    'page.applicationDetail.releases.serverReleases.rollback',
  );
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const handleUsecase = useHandler((payload: ReleaseRollbackPayload) => {
    const { deploymentId, release, releaseLabel, serverName } = payload;

    const rollBack = async () => {
      const response = await ApiDeploy.Rollback.$Id.doPost({
        deploymentId: String(deploymentId),
        release,
      });
      if (response.$status === 'success') {
        openToaster({
          variant: 'success',
          message: t('started', { release: releaseLabel, server: serverName }),
        });
        onSuccess();
        return;
      }
      openToaster({
        variant: 'error',
        title: t('failed'),
        message: getApiErrorDetail(response.error),
        duration: ERROR_TOAST_MS,
      });
      // A refusal (a deploy started meanwhile, the release is gone) means
      // the list on screen is out of date.
      onSuccess();
    };

    openDialog({
      title: t('title'),
      content: (
        <div className="grid gap-3 text-sm">
          <p>{t('body', { release: releaseLabel, server: serverName })}</p>
          <ul className="grid list-disc gap-1 pl-5 text-xs leading-relaxed">
            <li className="font-semibold">{t('noMigrations')}</li>
            <li>{t('keepsSettings')}</li>
            <li>{t('noReleaseCommands')}</li>
            <li>{t('restarts')}</li>
          </ul>
        </div>
      ),
      variant: 'warning',
      actions: [
        { label: t('confirm'), isPrimary: true, onClick: rollBack },
        { label: t('cancel') },
      ],
    });
  });

  return [handleUsecase] as const;
}
