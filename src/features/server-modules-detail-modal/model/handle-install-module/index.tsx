import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import type { Target } from '@/entities/host-group/rules/schema';

import { ApiModule } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useBaseContext } from '../../config/base-context';

interface InstallModuleParams {
  action: string;
  actionTitle?: string;
  target: Target;
  targetLabel: string;
  snapshotCount?: number;
  variables: Record<string, unknown>;
  ref?: {
    name?: string;
    expected_commit?: string;
  };
}

export default function useHandleInstallModule() {
  const [openDialog] = useDialog();
  const { moduleInfo } = useBaseContext();

  const [openToaster] = useToaster();

  const installModule = useHandler((params: InstallModuleParams) => {
    const actionTitle = params.actionTitle || params.action;
    const isHostGroupTarget = params.target.type === 'hostgroup';

    openDialog({
      title: 'Install role',
      content: (
        <>
          Run {actionTitle} for {moduleInfo.name} on{' '}
          {isHostGroupTarget ? params.targetLabel : 'the selected server'}?
          {isHostGroupTarget && params.snapshotCount != null ? (
            <>
              <br />
              This will snapshot exactly {params.snapshotCount} member
              {params.snapshotCount === 1 ? '' : 's'} before queueing.
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
              title: <>Failed to install {moduleInfo.name}</>,
              message: getApiErrorDetail(response.error),
            });
            return;
          }

          openToaster({
            variant: 'success',
            message: (
              <>{moduleInfo.name} installation was queued successfully.</>
            ),
          });
        },
      },
    });
  });

  return {
    installModule,
  };
}
