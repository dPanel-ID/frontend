import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { getPreflightRefusal } from '../lib/refusal';

import { PreflightCheckList } from './PreflightCheckList';

/**
 * Handles the API refusing a deployment on pre-flight checks. Call it with
 * the deploy response: for a refusal it opens a dialog with the failed
 * checks and returns true, so the caller stops there. "Deploy anyway"
 * runs `deployAnyway` (the same request with skip_preflight); Cancel, or
 * closing the dialog, deploys nothing.
 */
export function useDeployPreflightGuard() {
  const t = useDevetekTranslations('dialog.deployPreflight');
  const [openDialog] = useDialog();

  return useHandler(
    (
      response: { $status: string; error?: unknown },
      deployAnyway: () => void | Promise<void>,
    ): boolean => {
      const refusal = getPreflightRefusal(response);
      if (!refusal) return false;

      // Opened on the next tick: a deploy started from another dialog's
      // action closes that dialog once the action settles, and there is
      // one dialog on screen at a time.
      setTimeout(
        () =>
          openDialog({
            title: t('title'),
            content: (
              <div className="flex flex-col gap-3 text-sm">
                <p>{t('body')}</p>
                {refusal.checks.length ? (
                  <PreflightCheckList checks={refusal.checks} />
                ) : (
                  <p className="text-muted-foreground">{refusal.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('anywayNote')}
                </p>
              </div>
            ),
            variant: 'warning',
            actions: [
              {
                label: t('deployAnyway'),
                isPrimary: true,
                onClick: () => deployAnyway(),
              },
              { label: t('cancel') },
            ],
          }),
        0,
      );
      return true;
    },
  );
}
