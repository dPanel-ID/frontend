import { useEmit, useSubscribe } from './-model/events';
import useAddNewSshKeyUsecase from './-usecase/use-add-new-ssh-key';
import useCopyPublicKeyUsecase from './-usecase/use-copy-public-key';
import useDeleteSshKeyUsecase from './-usecase/use-delete-ssh-key';
import useOpenDetailsSshKeyUsecase from './-usecase/use-open-details';
import useOpenSshKeyMigrateOwnershipUsecase from './-usecase/use-open-migrate-ownership';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@ssh-keys/data--refresh', null);
  };

  const [handleAddNew] = useAddNewSshKeyUsecase();
  const [handleCopyPublicKey] = useCopyPublicKeyUsecase();
  const [handleDelete] = useDeleteSshKeyUsecase({
    onSuccess: handleDefaultSuccess,
  });
  const [handleOpenDetails] = useOpenDetailsSshKeyUsecase();
  const [handleOpenMigrateOwnership] = useOpenSshKeyMigrateOwnershipUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@ssh-keys/add-new', handleAddNew);
  useSubscribe('@ssh-keys/ssh-key--delete', handleDelete);
  useSubscribe('@ssh-keys/ssh-key--copy-public-key', handleCopyPublicKey);
  useSubscribe('@ssh-keys/open--details', handleOpenDetails);
  useSubscribe('@ssh-keys/open--migrate-ownership', handleOpenMigrateOwnership);

  return null;
}
