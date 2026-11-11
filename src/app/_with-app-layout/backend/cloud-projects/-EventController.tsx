import { useEmit, useSubscribe } from './-model/events';
import useAddNewCloudProjectUsecase from './-usecase/use-add-new-cloud-project';
import useDeleteCloudProjectUsecase from './-usecase/use-delete-cloud-project';
import useOpenDetailsUsecase from './-usecase/use-open-details';
import useOpenCloudProjectMigrateOwnershipUsecase from './-usecase/use-open-migrate-ownership';
import useOrphanVmsUsecase from './-usecase/use-orphan-vms';
import useUpdateCloudProjectCredentialsUsecase from './-usecase/use-update-cloud-project-credentials';
import OrphanVmsDialog from './-view/OrphanVmsDialog';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@cloud-projects/data--refresh', null);
  };

  const [handleAddNew] = useAddNewCloudProjectUsecase();
  const [handleDelete] = useDeleteCloudProjectUsecase({
    onSuccess: handleDefaultSuccess,
  });
  const [handleOpenDetails] = useOpenDetailsUsecase();
  const [handleUpdateCredentials] = useUpdateCloudProjectCredentialsUsecase({
    onSuccess: handleDefaultSuccess,
  });
  const [handleOpenMigrateOwnership] =
    useOpenCloudProjectMigrateOwnershipUsecase({
      onSuccess: handleDefaultSuccess,
    });

  useSubscribe('@cloud-projects/add-new', handleAddNew);
  useSubscribe('@cloud-projects/project--delete', handleDelete);
  useSubscribe(
    '@cloud-projects/open--migrate-ownership',
    handleOpenMigrateOwnership,
  );
  const [handleOpenOrphans, orphans] = useOrphanVmsUsecase();

  useSubscribe('@cloud-projects/open--details', handleOpenDetails);
  useSubscribe('@cloud-projects/open--orphans', handleOpenOrphans);
  useSubscribe(
    '@cloud-projects/open--update-credentials',
    handleUpdateCredentials,
  );

  return <OrphanVmsDialog {...orphans} />;
}
