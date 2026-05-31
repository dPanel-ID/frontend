import { useEmit, useSubscribe } from './-models/events';
import useLbDeleteUsecase from './-usecase/lb-delete';
import useLbOpenCreateUsecase from './-usecase/open-create';
import useLbOpenDetailsUsecase from './-usecase/open-details';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@load-balancers/data--refresh', null);
  };

  const [handleOpenCreate] = useLbOpenCreateUsecase();

  const [handleDelete] = useLbDeleteUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleOpenDetails] = useLbOpenDetailsUsecase();

  useSubscribe('@load-balancers/open--create', handleOpenCreate);
  useSubscribe('@load-balancers/lb--delete', handleDelete);
  useSubscribe('@load-balancers/open--details', handleOpenDetails);

  return null;
}
