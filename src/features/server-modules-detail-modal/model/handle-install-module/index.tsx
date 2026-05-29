import { useDialog } from '@/services/dialog';
import { useToaster } from '@/services/toaster';

import { ApiModule } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useBaseContext } from '../../config/base-context';

interface InstallModuleParams {
  action: string;
  actionTitle?: string;
  serverID: string;
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
    openDialog({
      title: 'Install role',
      content: (
        <>
          Run {actionTitle} for {moduleInfo.name} on the selected server?
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
              server_id: params.serverID,
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
