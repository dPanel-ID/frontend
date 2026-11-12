import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiModule, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface ModuleInstallationDeletePayload {
  serverId: string;
  installationId: string;
  moduleName: string;
  versionLabel: string;
  /**
   * A language version from the new runtime: Uninstall runs the module's
   * uninstall action, which removes it from the server (and refuses while an
   * application uses it). Holds the module input that names the version.
   */
  runtimeVersion?: { input: string; value: string };
  onSuccess?: () => void;
}

export default function useModuleInstallationDelete() {
  const t = useDevetekTranslations('page.serverDetail.sectionModules');
  const [deletingInstallationId, setDeletingInstallationId] = useState<
    string | null
  >(null);
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const deleteInstallation = useHandler(
    (payload: ModuleInstallationDeletePayload) => {
      const { installationId, moduleName, onSuccess, serverId, versionLabel } =
        payload;

      const { runtimeVersion } = payload;
      openDialog({
        title: t('uninstallDialog.title'),
        content: t(
          runtimeVersion
            ? 'uninstallDialog.runtimeMessage'
            : 'uninstallDialog.message',
          { module: moduleName, version: versionLabel },
        ),
        variant: 'warning',
        actions: {
          variant: 'YesNo',
          yes: async () => {
            setDeletingInstallationId(installationId);
            const response = runtimeVersion
              ? await ApiModule.Action.$Name.$Action.Run.doPost({
                  name: moduleName,
                  action: 'uninstall',
                  payload: {
                    server_id: serverId,
                    variables: { [runtimeVersion.input]: runtimeVersion.value },
                  },
                })
              : await ApiServer.Modules.$Id.$InstallationId.doDelete({
                  installationId,
                  serverId,
                });
            setDeletingInstallationId((current) =>
              current === installationId ? null : current,
            );

            if (response.$status === 'failed') {
              openToaster({
                variant: 'error',
                title: t('uninstallDialog.errorTitle', {
                  module: moduleName,
                  version: versionLabel,
                }),
                message: getApiErrorDetail(response.error),
              });
              return;
            }

            openToaster({
              variant: 'success',
              message: t(
                runtimeVersion
                  ? 'uninstallDialog.runtimeSuccess'
                  : 'uninstallDialog.success',
                { module: moduleName, version: versionLabel },
              ),
            });
            onSuccess?.();
          },
        },
      });
    },
  );

  return {
    deleteInstallation,
    deletingInstallationId,
  };
}
