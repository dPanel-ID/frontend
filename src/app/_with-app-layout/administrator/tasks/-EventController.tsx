import { useEmit, useSubscribe } from './-model/events';
import useDeleteTaskUsecase from './-usecase/use-delete-task';
import useReclaimTaskUsecase from './-usecase/use-reclaim-task';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@admin-tasks/data--refresh', null);
  };

  const [handleReclaim] = useReclaimTaskUsecase({
    onSuccess: handleDefaultSuccess,
  });
  const [handleDelete] = useDeleteTaskUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@admin-tasks/task--reclaim', handleReclaim);
  useSubscribe('@admin-tasks/task--delete', handleDelete);

  return null;
}
