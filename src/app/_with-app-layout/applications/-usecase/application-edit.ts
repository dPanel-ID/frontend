import type { ApplicationCard } from '@/entities/application/rules/schema';

import { useApplicationEditSidepanel } from '@/features/application-edit-sidepanel';

import useHandler from '@/shared/libs/react-hooks/useHandler';

interface Params {
  onSuccess: () => void;
}

export default function useApplicationEditUsecase(params: Params) {
  const { onSuccess } = params;

  const [openApplicationEditSidepanel] = useApplicationEditSidepanel();

  const handleUsecase = useHandler((data: ApplicationCard) => {
    if (data.identity.source !== 'repository') return;

    openApplicationEditSidepanel({
      onSuccess,
      applicationId: data.id,
      applicationName: data.identity.name,
    });
  });

  return [handleUsecase] as const;
}
