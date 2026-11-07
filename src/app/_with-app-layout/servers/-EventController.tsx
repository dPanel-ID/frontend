import {
  DeleteServerDialog,
  ReinstallServerDialog,
  useDeleteServer,
  useReinstallServer,
} from '@/features/server-lifecycle-dialogs';

import { useEmit, useSubscribe } from './-model/events';
import useServerOpenMigrateOwnershipUsecase from './-usecase/open-migrate-ownership';
import useServerEditSidepanelUsecase from './-usecase/server-edit-sidepanel';
import useServerStatusInfoDialogUsecase from './-usecase/server-status-info-dialog';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@resources::servers/servers-refresh', null);
  };

  const [handleOpenMigrateOwnership] = useServerOpenMigrateOwnershipUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe(
    '@resources::servers/server-migrate-ownership',
    handleOpenMigrateOwnership,
  );

  const [handleMachineReinstall, reinstall] = useReinstallServer({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@resources::servers/machine-reinstall', handleMachineReinstall);

  const [handleMachineDelete, deletion] = useDeleteServer({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@resources::servers/machine-delete', handleMachineDelete);

  const [handleServerStatusInfoDialog] = useServerStatusInfoDialogUsecase();

  useSubscribe(
    '@resources::servers/server-status-info-dialog',
    handleServerStatusInfoDialog,
  );

  const [handleServerEditSidepanel] = useServerEditSidepanelUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe(
    '@resources::servers/server-edit-sidepanel',
    handleServerEditSidepanel,
  );

  return (
    <>
      <DeleteServerDialog
        target={deletion.target}
        forgetOffer={deletion.forgetOffer}
        isDeleting={deletion.isDeleting}
        onConfirm={deletion.confirm}
        onClose={deletion.close}
      />
      <ReinstallServerDialog
        target={reinstall.target}
        isSubmitting={reinstall.isSubmitting}
        onConfirm={reinstall.confirm}
        onClose={reinstall.close}
      />
    </>
  );
}
