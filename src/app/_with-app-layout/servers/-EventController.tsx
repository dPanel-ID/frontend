import { useEmit, useSubscribe } from './-model/events';
import useMachineDeleteUsecase from './-usecase/machine-delete';
import useMachineReinstallUsecase from './-usecase/machine-reinstall';
import useServerOpenMigrateOwnershipUsecase from './-usecase/open-migrate-ownership';
import useServerEditSidepanelUsecase from './-usecase/server-edit-sidepanel';
import useServerStatusInfoDialogUsecase from './-usecase/server-status-info-dialog';
import { DeleteServerDialog } from './-view/dialogs/DeleteServerDialog';
import { ReinstallServerDialog } from './-view/dialogs/ReinstallServerDialog';

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

  const [handleMachineReinstall, reinstall] = useMachineReinstallUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@resources::servers/machine-reinstall', handleMachineReinstall);

  const [handleMachineDelete, deletion] = useMachineDeleteUsecase({
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
