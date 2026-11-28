import { useApplicationLifecycleEditSidepanel } from '@/features/application-lifecycle-edit-sidepanel';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { ApplicationLifecycleEditPayload } from '../-rules/usecase-types';

interface Params {
  onSuccess: () => void;
}

export default function useApplicationLifecycleEditUsecase(params: Params) {
  const { onSuccess } = params;

  const [openSidepanel] = useApplicationLifecycleEditSidepanel();

  const handleUsecase = useHandler(
    (payload: ApplicationLifecycleEditPayload) => {
      openSidepanel({
        onSuccess,
        applicationId: payload.applicationId,
        applicationName: payload.applicationName,
        lifecycle: payload.lifecycle,
        hasPort: payload.hasPort,
      });
    },
  );

  return [handleUsecase] as const;
}
