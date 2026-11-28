import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { useDeployPreflightGuard } from '@/entities/deploy-preflight';

import { ApiApplication, ApiDeploy } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { RuntimeMovePayload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

type Runtime = 'new' | 'previous';

/**
 * Moves an application to the new runtime (each language version installed
 * once per server, prebuilt) or back to the previous one: stores the choice,
 * then deploys the release again with its runtime install (bootstrap), which
 * rebuilds the application on that runtime and restarts it.
 */
export default function useRuntimeMoveUsecase(params: Params) {
  const { onSuccess } = params;
  const t = useDevetekTranslations('page.applicationDetail.releases.runtime');

  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const guardPreflight = useDeployPreflightGuard();

  const handleUsecase = useHandler((payload: RuntimeMovePayload) => {
    const { applicationId, artifactId, workerId } = payload;

    const move = async (runtime: Runtime) => {
      const stored = await ApiApplication.Update.$Id.doPost({
        applicationId: String(applicationId),
        payload: { app_config: { runtime } },
      });
      if (stored.$status !== 'success') {
        openToaster({
          variant: 'error',
          title: t('failed'),
          message: stored.error.message,
        });
        return;
      }
      await redeploy(runtime, false);
    };

    // The runtime choice is stored either way; a pre-flight refusal only
    // holds the redeploy until the user deploys anyway.
    const redeploy = async (runtime: Runtime, skipPreflight: boolean) => {
      const deployed = await ApiDeploy.Create.doPost({
        applicationId: String(applicationId),
        artifactId: String(artifactId),
        workerId: String(workerId),
        bootstrap: true,
        skipPreflight,
      });
      if (
        !skipPreflight &&
        guardPreflight(deployed, () => redeploy(runtime, true))
      ) {
        return;
      }
      if (deployed.$status !== 'success') {
        openToaster({
          variant: 'error',
          title: t('failed'),
          message: deployed.error.message,
        });
        return;
      }
      openToaster({
        variant: 'success',
        message: runtime === 'new' ? t('movedNew') : t('movedPrevious'),
      });
      onSuccess();
    };

    openDialog({
      title: t('title'),
      content: (
        <div className="flex flex-col gap-2 text-sm">
          <p>{t('body')}</p>
          <p className="text-muted-foreground">{t('note')}</p>
        </div>
      ),
      variant: 'info',
      actions: [
        { label: t('moveNew'), isPrimary: true, onClick: () => move('new') },
        { label: t('movePrevious'), onClick: () => move('previous') },
        { label: t('cancel') },
      ],
    });
  });

  return [handleUsecase] as const;
}
