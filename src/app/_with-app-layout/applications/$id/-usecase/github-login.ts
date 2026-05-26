import {
  buildFrontendReturnUrl,
  buildGithubAuthUrl,
} from '@/shared/libs/browser/oauth';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useAppDataModel } from '../-model/app-data';

export default function useGithubLoginUsecase() {
  const [applicationId] = useAppDataModel((s) => [s.applicationId]);

  const handleUsecase = useHandler(() => {
    localStorage.setItem('auth:provider', 'github');
    window.location.href = buildGithubAuthUrl(
      buildFrontendReturnUrl(`/applications/${applicationId}`),
    );
  });

  return [handleUsecase] as const;
}
