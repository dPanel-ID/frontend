import { useState } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiServer } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

interface ModuleInstallationDeletePayload {
  serverId: string;
  installationId: string;
  moduleName: string;
  versionLabel: string;
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

      openDialog({
        title: t('uninstallDialog.title'),
        content: t('uninstallDialog.message', {
          module: moduleName,
          version: versionLabel,
        }),
        variant: 'warning',
        actions: {
          variant: 'YesNo',
          yes: async () => {
            setDeletingInstallationId(installationId);
            const response =
              await ApiServer.Modules.$Id.$InstallationId.doDelete({
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
                message: response.error.message,
              });
              return;
            }

            openToaster({
              variant: 'success',
              message: t('uninstallDialog.success', {
                module: moduleName,
                version: versionLabel,
              }),
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
