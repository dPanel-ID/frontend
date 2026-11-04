import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useAddWorkerModal } from '../view/AddWorkerModal';

interface Params {
  workspaceId: string;
  onSuccess: () => void;
}

/** Opens the add-worker dialog for this workspace. */
export default function useAddWorkerUsecase(params: Params) {
  const { onSuccess, workspaceId } = params;
  const [openModal] = useAddWorkerModal();

  const handleUsecase = useHandler(() => {
    openModal({ workspaceId, onSuccess });
  });

  return [handleUsecase] as const;
}
