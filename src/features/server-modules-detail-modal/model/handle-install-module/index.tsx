import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiModule } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';
import type { ExplicitTarget } from '@/shared/rules/host-group';

import { useBaseContext } from '../../config/base-context';

import { isInstallAction } from './wording';

interface InstallModuleParams {
  action: string;
  actionTitle?: string;
  target: ExplicitTarget;
  targetLabel: string;
  snapshotCount?: number;
  variables: Record<string, unknown>;
  ref?: {
    name?: string;
    expected_commit?: string;
  };
}

export default function useHandleInstallModule() {
  const t = useDevetekTranslations('page.serverDetail.modules.installForm');
  const [openDialog] = useDialog();
  const { moduleInfo, onOperationQueued, onServerInstallQueued } =
    useBaseContext();

  const [openToaster] = useToaster();

  const installModule = useHandler((params: InstallModuleParams) => {
    const actionTitle = params.actionTitle || params.action;
    const isHostGroupTarget = params.target.type === 'hostgroup';
    // "Install Go on web-01?", not "Run Install Go for Go on the selected
    // server?": the module's own action title already names the module.
    const install = isInstallAction(params.action);
    const module = moduleInfo.name;

    openDialog({
      title: install
        ? t('confirmTitle', { module })
        : t('confirmActionTitle', { action: actionTitle }),
      content: (
        <>
          {install
            ? t('confirmInstall', { module, target: params.targetLabel })
            : t('confirmAction', {
                action: actionTitle,
                target: params.targetLabel,
              })}
          {isHostGroupTarget && params.snapshotCount != null ? (
            <>
              <br />
              {t('snapshot', { count: params.snapshotCount })}
            </>
          ) : null}
        </>
      ),
      variant: 'info',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const response = await ApiModule.Action.$Name.$Action.Run.doPost({
            name: moduleInfo.id,
            action: params.action,
            payload: {
              server_id:
                params.target.type === 'server' ? params.target.id : undefined,
              target:
                params.target.type === 'hostgroup' ? params.target : undefined,
              variables: params.variables,
              ref: params.ref,
            },
          });

          if (response.$status === 'failed') {
            openToaster({
              variant: 'error',
              title: t('queueFailed', { module }),
              message: getApiErrorDetail(response.error),
            });
            return;
          }

          if (params.target.type === 'hostgroup' && response.operation_id) {
            onOperationQueued?.(response.operation_id);
          }
          if (params.target.type === 'server') {
            onServerInstallQueued?.();
          }

          openToaster({
            variant: 'success',
            message: install
              ? t('queued', { module })
              : t('actionQueued', { action: actionTitle }),
          });
        },
      },
    });
  });

  return {
    installModule,
  };
}
