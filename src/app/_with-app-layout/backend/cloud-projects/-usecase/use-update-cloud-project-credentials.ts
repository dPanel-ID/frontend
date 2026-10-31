import { useCloudProjectCreateModal } from '@/features/cloud-project-create-modal';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { CloudProjectCredentialsPayload as Payload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

/** Opens the credential form of an account so a rotated key can replace it. */
export default function useUpdateCloudProjectCredentialsUsecase(
  params: Params,
) {
  const { onSuccess } = params;
  const [openModal] = useCloudProjectCreateModal();

  const handleUsecase = useHandler((payload: Payload) => {
    openModal({
      credentialTarget: payload,
      onSubmitSuccess: onSuccess,
    });
  });

  return [handleUsecase] as const;
}
